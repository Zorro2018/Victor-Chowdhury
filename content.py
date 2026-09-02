"""
Single source of truth for Victor Chowdhury's personal site content.

Everything here is synthesized from three resume variants (Product,
Data & AI, Business Strategy) into one coherent narrative. Keeping it as
plain data (not scattered across the template) means updating the site
later is a content edit, not a template hunt.
"""

PROFILE = {
    "name": "Victor Chowdhury",
    "tagline": "Data, AI & Product Leader",
    "subhead": (
        "I build the systems that decide what a business does next \u2014 "
        "metric layers, experiments, and the AI agents that put insight "
        "directly in a leader's hands \u2014 then help Product and Engineering "
        "ship it."
    ),
    "location": "Bentonville, Arkansas",
    "linkedin": "https://linkedin.com/in/victorchowdhury",
    "email": "victorchowdhury1988@gmail.com",
    "years_industry": 16,
    "years_walmart": "9+",
    "current_role": "Director, Strategic Insights & AI \u2014 Customer Engagement Services, Walmart",
}

ABOUT = [
    (
        "Sixteen years in analytics and AI, including nine-plus at Walmart, spent in the seam "
        "between what the data says, what engineering can build, and what the customer actually "
        "needs. I currently lead a 25+ person organization across four pillars \u2014 Self-Serve/"
        "Chatbots/AI, CRM, Workforce Management, and Ops \u2014 and have shipped alongside Product "
        "teams in customer service, fulfillment, facilities, fuel & convenience, and store innovation."
    ),
    (
        "My pattern is consistent: move analytics from reporting what happened to shaping what "
        "the business does next. That means building the metric repositories and governance that "
        "make enterprise data trustworthy, the experiments that prove what actually works, and "
        "increasingly, the AI agents that put certified answers in a leader's hands without a "
        "request queue in between."
    ),
    (
        "Equally at home setting three-year data strategy and prototyping the thing that proves "
        "it \u2014 comfortable with ambiguity, allergic to dashboards nobody acts on."
    ),
]

# ---------------------------------------------------------------------------
# Signature Work \u2014 the "impact by the numbers" band
# ---------------------------------------------------------------------------
IMPACT = [
    {
        "metric": "$36M",
        "label": "CRM AI Savings",
        "tag": "Customer Engagement",
        "detail": "Championed AI initiatives across CRM \u2014 including AI-based voice and chat "
                  "agents (Agent Assist) \u2014 measured and tracked through to realized savings.",
    },
    {
        "metric": "$330M",
        "label": "Asset Protection",
        "tag": "Intelligent Retail Lab",
        "detail": "Proactive alerting on shifting theft patterns, turning shrink prevention from "
                  "a lagging report into a live defense feeding Product and Engineering fixes.",
    },
    {
        "metric": "35%",
        "label": "GMV Lift",
        "tag": "WFS \u00b7 Marketplace",
        "detail": "Driven by transport partner acquisition, multi-channel strategy, and "
                  "efficiency gains across a multibillion-dollar fulfillment business.",
    },
    {
        "metric": "30% \u2192 70%",
        "label": "Self-Serve Rate",
        "tag": "Sierra Voice AI",
        "detail": "Lifted self-serve adoption for the AI voice assistant replacing traditional "
                  "IVR, with a consistent rise in CSAT alongside it.",
    },
    {
        "metric": "51% \u2192 73.5%",
        "label": "Appeasement Utilization",
        "tag": "Customer Engagement",
        "detail": "Redesigned appeasement strategy by issue type, customer value, and history; "
                  "insights went on to shape Walmart+ adoption strategy.",
    },
    {
        "metric": "26%",
        "label": "Merchandise Sales Lift",
        "tag": "Fuel & Convenience",
        "detail": "Demand and in-stock signals that turned fuel traffic into inside-store "
                  "purchases for associates and merchants.",
    },
    {
        "metric": "AISLE1",
        "label": "Agentic AI Product",
        "tag": "Claude + BigQuery",
        "detail": "Built the org's governed metric repository as a conversational AI product \u2014 "
                  "leaders query certified definitions in natural language.",
    },
    {
        "metric": "$6M",
        "label": "Vendor Contract Closed",
        "tag": "Wipro \u00b7 Pre-Sales",
        "detail": "Single-handedly closed an exclusive Alteryx agreement from initial evaluation "
                  "through to a signed preferred-provider deal.",
    },
]

# ---------------------------------------------------------------------------
# Experience buckets \u2014 four lenses on the same career, each with anecdotes
# ---------------------------------------------------------------------------
BUCKETS = [
    {
        "id": "ai",
        "label": "AI",
        "intro": (
            "Agentic AI, GenAI, computer vision, and conversational AI \u2014 built to change a "
            "decision, not just add a feature. My focus is always the measurement framework "
            "underneath: how do we know it worked?"
        ),
        "anecdotes": [
            {
                "title": "AISLE1: Putting Certified Metrics in a Conversation",
                "tag": "Claude + BigQuery",
                "body": "Built an agentic AI insights product that serves as the org's governed "
                        "metric repository. Leaders query certified definitions in natural "
                        "language and get narrative answers with context \u2014 not just tables \u2014 "
                        "and the semantic layer keeps the number the same no matter who asks. It "
                        "absorbed the recurring ad hoc analysis load and now powers \u201c4-in-the-box\u201d "
                        "product, ops, and engineering reviews.",
            },
            {
                "title": "Sierra Voice AI: Defining What \u201cGood\u201d Looks Like",
                "tag": "Conversational AI",
                "body": "Owned the measurement framework \u2014 containment, resolution, cost per "
                        "contact \u2014 that leadership used to judge the shift from traditional IVR "
                        "to an AI voice assistant. Self-serve rate rose from 30% to 70%, with CSAT "
                        "climbing alongside it rather than trading off against it.",
            },
            {
                "title": "Agent Assist: From Pilot to Scale",
                "tag": "AI-based CRM Platform",
                "body": "Partnered directly with Product on AI-based voice and chat agents on the "
                        "CRM platform \u2014 requirements and problem framing, pilot design, launch "
                        "readiness, adoption tracking, and post-launch iteration. Part of a broader "
                        "CRM AI push that delivered $36M in realized savings.",
            },
            {
                "title": "Computer Vision at the Store of the Future",
                "tag": "Intelligent Retail Lab",
                "body": "Directed the data analytics and ML team behind a computer-vision "
                        "shrink-prevention platform. Behavior and shrink-pattern analysis drove "
                        "material product improvements, preventing $330M in loss and producing a "
                        "filed patent (Virtual Cart Optimization Tool).",
            },
        ],
    },
    {
        "id": "product",
        "label": "Product",
        "intro": (
            "I build the analytics that decide what gets built \u2014 instrumentation, funnels, "
            "experiment design, and the success metrics a product is judged on \u2014 embedded with "
            "Product from problem definition through launch and scale."
        ),
        "anecdotes": [
            {
                "title": "Shipping the Instrumentation Behind the Roadmap",
                "tag": "Product Analytics",
                "body": "Own product analytics for the full service portfolio \u2014 instrumentation, "
                        "journey funnels, containment and escalation analysis, and self-serve deep "
                        "dives that tell Product exactly where customers dropped off and which "
                        "experiences to rebuild first.",
            },
            {
                "title": "Walmart+ Fuel Benefits: Adoption from Day One",
                "tag": "Membership Growth",
                "body": "Partnered with the Walmart+ product team to launch a member fuel "
                        "benefit, building the adoption and redemption tracking that connected "
                        "fuel behavior to membership growth and retention from the first day of "
                        "launch.",
            },
            {
                "title": "Tech Assist: Turning Maintenance Reactive to Proactive",
                "tag": "Facility Services",
                "body": "Partnered with Product to deploy live refrigeration and HVAC telemetry "
                        "monitoring, giving field teams a signal before equipment failed \u2014 turning "
                        "a maintenance queue into a proactive product experience.",
            },
            {
                "title": "Metric Governance as a Product Decision",
                "tag": "Decision Systems",
                "body": "Established definitions, architecture review, and sign-off processes "
                        "that gave Product one trusted source of truth for roadmap and "
                        "prioritization \u2014 replacing dashboard sprawl with an actual decision "
                        "system.",
            },
        ],
    },
    {
        "id": "strategy",
        "label": "Business Strategy",
        "intro": (
            "I work at the seam where physical footprint, operating model, cost structure, and "
            "customer experience meet \u2014 framing the right problems and converting complex "
            "operational challenges into scalable capabilities."
        ),
        "anecdotes": [
            {
                "title": "Building Fuel & Convenience from the Ground Up",
                "tag": "0\u21921 Business Strategy",
                "body": "Built the strategy and data foundation for a new division from zero, "
                        "standing up the metrics an entire business needed to operate \u2014 and drove "
                        "a 26% merchandise sales lift by connecting fuel traffic to inside-store "
                        "purchases.",
            },
            {
                "title": "Middle-Mile Strategy: Internal Consolidation Centers",
                "tag": "Network Strategy",
                "body": "Helped shape the build-out and operating case for Internal Consolidation "
                        "Centers, modeling flow, capacity, and cost-to-serve to inform how volume "
                        "moved through the network \u2014 part of a 35% GMV lift for the fulfillment "
                        "business.",
            },
            {
                "title": "One-Page Decision Briefs for 200+ Leaders",
                "tag": "Executive Communication",
                "body": "Translated network economics \u2014 cost to serve, capacity, carrier "
                        "performance \u2014 into a one-page format used every week across Weekly "
                        "Business Reviews, making complex trade-offs legible fast for a "
                        "multibillion-dollar business.",
            },
            {
                "title": "From Reactive Tickets to Proactive Asset Strategy",
                "tag": "Connected Assets",
                "body": "Built the data and IoT foundation for Facilities Maintenance \u2014 "
                        "architecture, telemetry flows, asset hierarchy \u2014 shifting the operating "
                        "model from ticket response to prevention and informing capital versus "
                        "expense decisions on repair-or-replace.",
            },
        ],
    },
    {
        "id": "data",
        "label": "Data",
        "intro": (
            "Enterprise data only creates value if people trust it and can actually get to it. "
            "I build the metric repositories, governance, and self-service layers that make that "
            "true at scale."
        ),
        "anecdotes": [
            {
                "title": "A 300K+ User Analytics Platform",
                "tag": "Enterprise Platform",
                "body": "Owned capacity, row-level security, and self-service enablement for an "
                        "enterprise analytics platform serving 300,000+ users, and designed a "
                        "data-lake landscape that shifted the org toward self-service.",
            },
            {
                "title": "NLP Self-Service at Sam's Club",
                "tag": "Applied NLP",
                "body": "Shipped natural-language self-service so senior leaders could query "
                        "their own data in free-form text \u2014 then trained them on it, treating "
                        "adoption as seriously as the technical build.",
            },
            {
                "title": "Experimentation as a Practice, Not a One-Off",
                "tag": "Causal Impact",
                "body": "Ran control-group testing and IVR modernization measurement, built AHT "
                        "trackers, and recovered IEX forecasting accuracy from red to green \u2014 "
                        "turning experimentation into a standing capability rather than a special "
                        "project.",
            },
            {
                "title": "Text Analytics to Find the Root Cause",
                "tag": "Diagnostic Analytics",
                "body": "Used text analytics to diagnose root causes across the bottom 10% of "
                        "Sam's Club locations and target intervention precisely \u2014 grounded by "
                        "running field inspections as first-hand user research.",
            },
        ],
    },
]

# ---------------------------------------------------------------------------
# Career timeline (condensed, reverse-chronological)
# ---------------------------------------------------------------------------
TIMELINE = [
    {
        "title": "Director, Strategic Insights & AI",
        "org": "Customer Engagement Services, Walmart",
        "dates": "Jun 2025 \u2014 Present",
        "blurb": "Agentic AI, conversational AI, and service economics for a 25+ person, "
                 "four-pillar organization.",
    },
    {
        "title": "Director, Advanced Analytics",
        "org": "Walmart Fulfillment Services",
        "dates": "Feb 2024 \u2014 Jul 2025",
        "blurb": "Insight and measurement strategy for a multibillion-dollar fulfillment "
                 "business \u2014 multi-channel, carrier, and consolidation network economics.",
    },
    {
        "title": "Director, Data Analytics",
        "org": "Intelligent Retail Lab",
        "dates": "Jul 2022 \u2014 Feb 2024",
        "blurb": "0\u21921 emerging technology: computer-vision shrink prevention and "
                 "next-generation checkout evaluation.",
    },
    {
        "title": "Senior Manager, Data Analytics",
        "org": "Real Estate, Facility Services, Fuel & Convenience",
        "dates": "Feb 2020 \u2014 Jul 2022",
        "blurb": "Connected-asset products, IoT telemetry, and membership growth strategy "
                 "for two divisions built largely from the ground up.",
    },
    {
        "title": "Senior Manager, Data Analytics",
        "org": "Safety & Compliance, Sam's Club",
        "dates": "Jul 2018 \u2014 Feb 2020",
        "blurb": "Enterprise safety metrics platform, NLP self-service, and field-grounded "
                 "root-cause analytics.",
    },
    {
        "title": "Senior System Engineer",
        "org": "Analytics & Visualization Technology, Walmart",
        "dates": "Jan 2017 \u2014 Jul 2018",
        "blurb": "Owned a 300K+ user analytics platform and led the shift toward "
                 "self-service across the enterprise.",
    },
    {
        "title": "BI Consultant",
        "org": "Wipro \u2014 Nike Workforce Insights Network & Client Engagement",
        "dates": "Feb 2014 \u2014 Jan 2017",
        "blurb": "HR analytics, client-facing discovery, and vendor partnerships (Alteryx, "
                 "Domo) as part of the pre-sales team.",
    },
    {
        "title": "BI Developer",
        "org": "Wipro \u2014 Nike & GMACI",
        "dates": "Sep 2010 \u2014 Feb 2014",
        "blurb": "Cognos reporting, SAP HR modeling, and mainframe-to-modern analytics "
                 "migration.",
    },
]

CAPABILITIES = [
    "AI & Analytics Strategy / Roadmapping",
    "Agentic AI & GenAI Applications",
    "Product Analytics & Instrumentation",
    "Enterprise Metric & Semantic Layers",
    "Experimentation & Causal Impact",
    "ML Deployment & Productionization",
    "Data Architecture & Modeling",
    "Computer Vision & NLP Applications",
    "Conversational AI (Voice & Chat)",
    "Business Case & Investment Framing",
    "Executive Stakeholder Influence",
    "Org Building & Talent Development",
    "Operating Model & Governance Design",
    "Capital & Expense Optimization",
    "Responsible AI, Risk & Privacy",
    "Rapid Prototyping / \u201cVibe Coding\u201d",
]

EDUCATION = [
    {"title": "Certificate, Machine Learning", "org": "Cornell University \u00b7 Apr 2021"},
    {"title": "Certificate, Product Management", "org": "Cornell University \u00b7 Nov 2020"},
    {"title": "PGDBA, Marketing", "org": "Symbiosis Centre for Distance Learning \u00b7 2012\u20132014"},
    {"title": "B.Tech, Information Technology", "org": "West Bengal University of Technology \u00b7 2006\u20132010"},
]

CERTIFICATIONS = [
    "Intro to Generative AI for Data Analysis \u2014 Microsoft",
    "Core Designer Certificate \u2014 Dataiku",
    "Alteryx Designer Core \u2014 Alteryx",
    "Tableau Desktop Specialist \u2014 Tableau",
    "Google Analytics Certification \u2014 Google",
    "Intro to CS & Programming Using Python \u2014 MIT",
    "IBM Cognos 10 BI Administrator \u00b7 Reports \u00b7 Metadata Modeling",
]

RECOGNITION = {
    "patent": "Virtual Cart Optimization Tool (Patent Filed)",
    "honors": "Certificate of Appreciation \u00b7 Feather in My Cap (\u00d72) \u00b7 Thanks a Zillion \u00b7 IT Wiz 2005",
    "languages": "English (Full Professional) \u00b7 Hindi (Full Professional) \u00b7 Bengali (Professional Working)",
}

RESUMES = [
    {"label": "Product CV", "file": "Victor_Chowdhury_CV_Product.pdf"},
    {"label": "AI & Data CV", "file": "Victor_Chowdhury_CV_Data_AI.pdf"},
    {"label": "Business Strategy CV", "file": "Victor_Chowdhury_CV_Business_Strategy.pdf"},
]

# ---------------------------------------------------------------------------
# Work samples — live, linkable artifacts that back up the anecdotes above
# ---------------------------------------------------------------------------
WORK_SAMPLES = [
    {
        "title": "Promo & Appeasement Analysis Dashboard",
        "tag": "Interactive Data Product",
        "description": (
            "Multi-tab analysis of promo code issuance, redemption, and GMV lift by "
            "category and membership tier — the kind of decision-ready insight surface "
            "behind the appeasement strategy work that lifted utilization from 51% to "
            "73.5%."
        ),
        "thumbnail": "/static/appeasement-analysis.png",
        "url": "https://zorro2018.github.io/Appeasement-Analysis/",
    },
    {
        "title": "CES Weekly Update — Searchable, Not Just Skimmable",
        "tag": "Executive Reporting, Reimagined",
        "description": (
            "Reimagined the standard weekly status report as a searchable, taggable archive "
            "instead of a deck nobody reopens. Search surfaces matches across every past week "
            "instantly, and each update carries built-in Appreciate / Feature Request / "
            "Escalate actions — turning a routine reporting ritual into something leadership "
            "actually engages with."
        ),
        "thumbnail": "/static/weekly-update.png",
        "url": "https://zorro2018.github.io/Weekly-Update/",
    },
    {
        "title": "Call Complexity Scorecard",
        "tag": "Contact Center Analytics",
        "description": (
            "A weighted, six-factor scoring model that classifies every contact as "
            "Low, Medium, or High complexity from contact reason, workflow count, "
            "talk %, repeat calls, transfers, and genuine/non-genuine intent \u2014 "
            "turning a vague sense of 'this queue feels hard' into a defensible, "
            "auditable score leadership can route, coach, and staff against."
        ),
        "thumbnail": "/static/call-complexity.png",
        "url": "https://zorro2018.github.io/Call-Complexity/",
    },
]

# ---------------------------------------------------------------------------
# Articles — thought-leadership writeups, same card treatment as work samples
# ---------------------------------------------------------------------------
ARTICLES = [
    {
        "title": "Claude vs. Power BI/Tableau: A Working Model, Not a Cage Match",
        "tag": "Strategic Insights & AI · Tool Selection Brief",
        "description": (
            "A framework for where each tool actually earns its place — governed "
            "dashboarding for ‘what is happening’ versus reasoning-driven, narrative-ready "
            "insight for ‘what does it mean, and what should a leader do about it.’ "
            "Includes an illustrative cost model showing why the two tools’ economics "
            "scale on completely different axes — viewers versus reasoning work."
        ),
        "thumbnail": "/static/ai-vs-bi.png",
        "url": "https://zorro2018.github.io/AIvsBI/",
    },
    {
        "title": "Stop Being Overwhelmed. Start Delivering What Matters.",
        "tag": "Analytics Leadership · Prioritization Playbook",
        "description": (
            "A six-step field guide for analytics teams drowning in ad hoc requests — "
            "Intake, Classify, Question, Score, Validate, Launch — built to turn a chaotic "
            "request queue into a defensible, confidence-backed prioritization process "
            "instead of whoever-asks-loudest."
        ),
        "thumbnail": "/static/prioritization-framework.png",
        "url": "https://zorro2018.github.io/Prioritization_Framework/",
    },
]

# ---------------------------------------------------------------------------
# Certificates — verified credentials, same card treatment
# ---------------------------------------------------------------------------
CERTIFICATES = [
    {
        "title": "Certificate in Product Management",
        "tag": "Cornell Tech · Nov 2020",
        "description": (
            "Verified credential from Cornell Tech covering product strategy, discovery, "
            "and roadmapping — the foundation underneath the product-analytics work in the "
            "Experience section above."
        ),
        "thumbnail": "/static/cert1.png",
        "url": "https://mycredentials.ecornell.cornell.edu/credential/zLAVuhLhFu",
    },
    {
        "title": "Certificate in Machine Learning",
        "tag": "Cornell Ann S. Bowers CIS · Apr 2021",
        "description": (
            "Verified credential from Cornell's Ann S. Bowers College of Computing and "
            "Information Science — the technical grounding behind the ML deployment and "
            "computer-vision work at Intelligent Retail Lab."
        ),
        "thumbnail": "/static/cert2.png",
        "url": "https://mycredentials.ecornell.cornell.edu/credential/DIWWrrVWPN",
    },
]
