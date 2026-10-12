import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const faqSections = [
  {
    title: "Pricing & Budget",
    questions: [
      {
        q: "How much does interior design cost?",
        a: "Our projects typically range from ₹5 Lakhs for a single room to ₹85 Lakhs+ for luxury villas. The cost depends on property size, scope, material selection, and budget tier (Essential, Premium, or Luxury). Use our online pricing calculator for an instant estimate, or book a free consultation for a detailed quote.",
      },
      {
        q: "Are there any hidden charges?",
        a: "Absolutely not. Our pricing is 100% transparent. Every quote includes a detailed line-item breakdown covering design, materials, manufacturing, installation, and taxes. The price you approve is the price you pay.",
      },
      {
        q: "What payment terms do you offer?",
        a: "We follow a milestone-based payment structure: 10% at booking, 40% at design approval, 30% at manufacturing completion, and 20% at installation and handover. We accept bank transfers, cheques, and all major cards.",
      },
    ],
  },
  {
    title: "Timeline & Delivery",
    questions: [
      {
        q: "How long does a complete interior project take?",
        a: "A standard 2-3 BHK project takes approximately 45 days from design approval to handover. Larger projects like villas or complete offices may take 60-90 days. We guarantee our timelines with contractual commitments.",
      },
      {
        q: "Can you work on tight deadlines?",
        a: "Yes, we offer priority delivery for time-sensitive projects. Our in-house manufacturing facility allows us to fast-track production without compromising quality. Additional charges may apply for expedited timelines.",
      },
    ],
  },
  {
    title: "Warranty & Materials",
    questions: [
      {
        q: "What warranty do you provide?",
        a: "We provide a comprehensive 30-year warranty on all modular installations, covering manufacturing defects, structural integrity, and hardware performance. Regular wear and tear is excluded. Our warranty is backed by a dedicated aftercare team.",
      },
      {
        q: "What materials and hardware do you use?",
        a: "We use BWP (Boiling Water Proof) grade plywood, CARB-certified MDF, premium laminates from Merino/Greenlam, and German hardware from Hettich, Blum, and Hafele. All materials are sourced from certified suppliers and undergo rigorous quality checks.",
      },
      {
        q: "Do you offer eco-friendly material options?",
        a: "Yes, we offer CARB Phase 2 compliant boards, low-VOC paints and finishes, FSC-certified wood, and recycled material options. Ask your designer about our Green Home package for a fully sustainable interior solution.",
      },
    ],
  },
  {
    title: "Customization & Design",
    questions: [
      {
        q: "Can I customize every aspect of my design?",
        a: "Absolutely. Every Terranest project is fully bespoke. From layout and furniture dimensions to material finishes and hardware — everything is tailored to your preferences. We never use off-the-shelf, one-size-fits-all solutions.",
      },
      {
        q: "Do you provide 3D visualizations?",
        a: "Yes, all Premium and Luxury tier projects include photorealistic 3D renders and virtual walkthroughs. This allows you to see and approve every detail of your design before manufacturing begins.",
      },
      {
        q: "Can I make changes after the design is finalized?",
        a: "Minor changes are accommodated at no extra cost. Major design changes after manufacturing has begun may incur additional charges and timeline adjustments. We recommend finalizing all details during the 3D visualization phase.",
      },
    ],
  },
  {
    title: "Support & Service",
    questions: [
      {
        q: "Do you service my city?",
        a: "We currently operate in Bengaluru, Mumbai, Hyderabad, Chennai, and Pune with full project management. For other cities, we offer remote design services with local installation partner support. Contact us for availability.",
      },
      {
        q: "What happens after project handover?",
        a: "Our relationship continues long after handover. You get access to our dedicated aftercare team for any maintenance needs, hardware adjustments, or future design requirements. We also conduct a complimentary 90-day post-installation check.",
      },
      {
        q: "How do I get started?",
        a: "Simply book a free consultation through our website, WhatsApp, or phone. A design expert will understand your requirements, visit your site, and present a detailed proposal within 5 working days — all free of charge.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-16 bg-beige">
        <div className="container-luxe">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-tech text-gold mb-4 block">
            FAQ
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-display text-charcoal max-w-3xl"
          >
            Frequently Asked <span className="italic text-gold">Questions</span>
          </motion.h1>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-luxe max-w-3xl">
          {faqSections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mb-12 last:mb-0"
            >
              <h2 className="font-heading text-2xl text-charcoal mb-6">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {section.questions.map((item, j) => (
                  <AccordionItem
                    key={j}
                    value={`${i}-${j}`}
                    className="bg-offwhite rounded-sm border-none px-6"
                  >
                    <AccordionTrigger className="text-left font-body font-medium text-charcoal text-sm hover:text-gold hover:no-underline py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm font-body text-gray-500 leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}

          <div className="text-center mt-16 p-8 bg-beige rounded-sm">
            <h3 className="font-heading text-xl text-charcoal mb-3">
              Still have questions?
            </h3>
            <p className="text-sm font-body text-gray-500 mb-6">
              Our team is happy to help with any queries about your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-white font-body font-medium text-sm hover:bg-gold transition-colors rounded-sm"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-charcoal text-charcoal font-body font-medium text-sm hover:bg-charcoal hover:text-white transition-colors rounded-sm"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}