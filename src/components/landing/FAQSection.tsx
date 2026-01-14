import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Como funciona a importação de dados?",
      answer: "A importação é super simples! Você pode conectar diretamente seu ERP ou enviar planilhas Excel/CSV. Nossa plataforma reconhece automaticamente os campos principais e mapeia seus dados para a estrutura do Nexmart. Todo o processo leva menos de 10 minutos."
    },
    {
      question: "Existe suporte técnico disponível?",
      answer: "Sim! Oferecemos suporte completo por email (Plano Básico) e suporte prioritário via chat e telefone (Plano Pro). Nossa equipe está sempre pronta para ajudar você a aproveitar ao máximo o Nexmart."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Absolutamente! Não há fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer momento através do painel administrativo, e terá acesso aos recursos até o final do período pago."
    },
    {
      question: "Meus dados ficam seguros na plataforma?",
      answer: "Segurança é nossa prioridade! Utilizamos criptografia de ponta a ponta, backups automáticos diários e hospedagem em servidores certificados. Seus dados são 100% privados e protegidos, atendendo às normas da LGPD."
    },
    {
      question: "Preciso de conhecimento técnico para usar?",
      answer: "Não! O Nexmart foi desenvolvido pensando na simplicidade. Se você consegue usar WhatsApp, consegue usar o Nexmart. A interface é intuitiva e oferecemos tutoriais em vídeo para todos os recursos principais."
    }
  ];

  return (
    <section className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Tire suas dúvidas sobre o Nexmart e como ele pode transformar seu supermercado.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
