import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Event received: event.type

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Processing checkout.session.completed

        const userId = session.metadata?.supabase_user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          break;
        }

        // Get the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Find the plan by stripe_price_id
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('stripe_price_id', priceId)
          .single();

        if (planError || !plan) {
          break;
        }

        // Update or insert subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          console.error('❌ Error upserting subscription:', subError);
        } else {
          console.log('✅ Subscription created/updated for user:', userId);
        }

        // Update profile with stripe_customer_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', userId);

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
        }

        // Record payment in payment_history
        const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
        if (amountPaid > 0) {
          const { data: currentSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (currentSub) {
            const { error: paymentError } = await supabase
              .from('payment_history')
              .insert({
                subscription_id: currentSub.id,
                amount: amountPaid,
                currency: session.currency?.toUpperCase() || 'BRL',
                status: 'paid',
                stripe_invoice_id: session.invoice as string,
                paid_at: new Date().toISOString(),
              });

            if (paymentError) {
              console.error('❌ Error recording payment:', paymentError);
            } else {
              console.log('✅ Payment recorded:', amountPaid, session.currency);
            }
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Processing customer.subscription.updated:', subscription.id);

        const priceId = subscription.items.data[0].price.id;

        // Find the plan by stripe_price_id
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('stripe_price_id', priceId)
          .maybeSingle();

        const updateData: any = {
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        if (plan) {
          updateData.plan_id = plan.id;
        }

        const { error: subError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        if (subError) {
          console.error('❌ Error updating subscription:', subError);
        } else {
          console.log('✅ Subscription updated:', subscription.id, 'Status:', subscription.status);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Processing customer.subscription.deleted:', subscription.id);

        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (subError) {
          console.error('❌ Error canceling subscription:', subError);
        } else {
          console.log('✅ Subscription canceled:', subscription.id);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Processing invoice.payment_succeeded:', invoice.id);

        if (invoice.subscription) {
          // Get subscription from database
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            const { error: paymentError } = await supabase
              .from('payment_history')
              .insert({
                subscription_id: subscription.id,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency?.toUpperCase() || 'BRL',
                status: 'paid',
                stripe_invoice_id: invoice.id,
                paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
              });

            if (paymentError) {
              console.error('❌ Error recording payment:', paymentError);
            } else {
              console.log('✅ Payment recorded:', invoice.amount_paid / 100, invoice.currency);
            }
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('❌ Processing invoice.payment_failed:', invoice.id);

        if (invoice.subscription) {
          // Update subscription status to past_due
          const { error: subError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription);

          if (subError) {
            console.error('❌ Error updating subscription to past_due:', subError);
          } else {
            console.log('✅ Subscription marked as past_due:', invoice.subscription);
          }

          // Record failed payment
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            const { error: paymentError } = await supabase
              .from('payment_history')
              .insert({
                subscription_id: subscription.id,
                amount: invoice.amount_due / 100,
                currency: invoice.currency?.toUpperCase() || 'BRL',
                status: 'failed',
                stripe_invoice_id: invoice.id,
              });

            if (paymentError) {
              console.error('❌ Error recording failed payment:', paymentError);
            } else {
              console.log('✅ Failed payment recorded');
            }
          }
        }

        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
