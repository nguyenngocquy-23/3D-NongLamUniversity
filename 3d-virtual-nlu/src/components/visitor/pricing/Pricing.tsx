import React from "react";
import styles from "../../../styles/visitor/pricing.module.css";

type PlanFeature = string;

interface Plan {
  name: string;
  priceMonthly?: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  limitNote?: string;
}

const plans: Plan[] = [
  {
    name: "Basic",
    priceMonthly: "$0",
    description: "Ideal if you want to try Kuula and promote your work!",
    features: [
      "Upload & config images 360",
      "Level correction",
      "Add images and labels",
      "Easily share and embed",
      "Virtual Reality experience (360° photos)",
      "Tiny planet editor",
    ],
    limitNote: "Up to 300 posts (max 100 uploads/month) + self support",
  },
  {
    name: "Pro",
    priceMonthly: "$16",
    priceNote: "billed annually",
    description: "Build great Virtual Tours. Share them with custom branding.",
    features: [
      "Includes Basic, plus:",
      "Virtual Tour editor",
      "Branding: your logo",
      "Unlisted & private tours",
      "Improved photo quality",
      "Custom hotspot icons",
      "Duplicate tours",
      "Audio support",
      "Unlimited tours / 100,000 posts",
      "Premium support",
      "HD embeds with Virtual Reality",
      "No ads",
      "Exclusive discounts",
    ],
  },
  {
    name: "Business",
    priceMonthly: "$36",
    priceNote: "billed annually",
    description:
      "Advanced branding, custom domains. Enhanced privacy and analytics.",
    features: [
      "Includes Pro, plus:",
      "Custom domain with SSL",
      "Branding: multiple logos",
      "Password protected tours",
      "Detailed analytics",
      "Landing page editor",
      "Unlimited tours / unlimited posts",
      "Priority support",
      "Whitelisted social posting",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Enterprise-grade features and dedicated training/support program.",
    features: [],
  },
];

const Pricing: React.FC = () => {
  return (
    <div className={styles.pricingPage}>
      <header>
        <h1>Choose the right plan for you!</h1>
        <p>
          Kuula is the ideal Virtual Tour Software for companies that use
          3D/360 tours — for photographers, real-estate, and more.
        </p>
      </header>

      <div className={styles.plans}>
        {plans.map((plan) => (
          <div key={plan.name} className={styles.planCard}>
            <h2>{plan.name}</h2>

            {plan.priceMonthly && (
              <p className={styles.price}>
                {plan.priceMonthly}
                {plan.priceNote && (
                  <span className={styles.priceNote}>
                    {" "}
                    ({plan.priceNote})
                  </span>
                )}
                <span>/month</span>
              </p>
            )}

            <p className={styles.planDescription}>{plan.description}</p>

            <ul className={styles.features}>
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            {plan.limitNote && (
              <p className={styles.limitNote}>{plan.limitNote}</p>
            )}

            <button className={styles.btnSelect}>Go {plan.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
