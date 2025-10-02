const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan?.stripe_price_id) {
        toast({
          title: "Erro de Configuração",
          description: "O ID de preço deste plano não foi encontrado.",
          variant: "destructive",
        });
        setSelectedPlan(null);
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: plan.stripe_price_id },
      });

      // ** CORREÇÃO PARA TRATAMENTO DE ERRO **
      if (invokeError || (data && data.error)) {
        const errorMessage = data?.error?.message || invokeError?.message || "Falha ao iniciar o checkout.";
        throw new Error(errorMessage);
      }

      // Verifica se a URL foi retornada antes de redirecionar
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.sessionId) {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          throw new Error('Stripe.js não carregou.');
        }
      } else {
        throw new Error('Resposta inválida do servidor.');
      }

    } catch (error) {
      console.error('Erro em handleSubscribe:', error);
      toast({
        title: "Erro ao Assinar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    }
  };
