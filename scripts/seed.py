import json, hashlib, random
random.seed(7)
PW = "demo1234"
def h(salt): return hashlib.sha256(f"{salt}:{PW}".encode()).hexdigest()
def acct(i):
    s = f"s{i}x{random.randint(1000,9999)}"
    return {"salt": s, "pwHash": h(s)}

ROLES = ["Data Analyst","BI Analyst / BI Developer","Business Analyst","Data Scientist","Data Engineer",
 "Analytics Engineer","Machine Learning Engineer","AI Engineer","Generative AI Engineer","MLOps Engineer",
 "AI Product Specialist / Manager","Data / AI Solutions Architect","AI Researcher","Data Annotator / AI Trainer","AI Educator / Trainer"]

settings = {
 "verifyEmail": "verification@your-dsn-domain.org",
 "roles": ROLES,
 "programmes": ["AI Bootcamp","AI Summit Hackathon","AI Skills Week","DSN Ambassador Programme","Women in AI","AI Academy (online)","AI for Kids / Teens Facilitator","Other DSN programme"],
 "roleDocs": ["Updated CV (PDF)","Employment letter, contract or reference for the role you are claiming","2–3 work samples or project links that show the role in practice","Any certificate relevant to the role"],
 "ratingDocs": ["Updated CV (PDF)","Certificates and transcripts (education and professional)","Links to your best projects (GitHub, Kaggle, dashboards, reports)","Employment letters or references for past roles"],
 "processNote": "Use the subject line shown, attach everything in one email, and keep files under 10MB. A reviewer will check your documents within 10 working days. They may ask you for a short online interview before giving a result.",
 "premiumNote": "Premium members can see which companies viewed their profile. Contact the DSN talent team to activate Premium.",
 "updatedAt": "2026-09-28T09:00:00Z"
}

def member(i, dsn, name, gender, loc, headline, summary, skills, exp, proj, edu, cert, ach, roles, scores, status, premium, emp, title, org, created, reviewed=None, email=None):
    d = {"dsnId": dsn, "name": name, "email": email or (name.split()[0].lower()+"@example.com"), "phone": "", "gender": gender,
         "location": loc, "headline": headline, "summary": summary, "skills": skills, "experience": exp, "projects": proj,
         "education": edu, "certifications": cert, "achievements": ach, "roles": roles, "scores": scores,
         "scoreStatus": status, "reviewedAt": reviewed, "premium": premium, "visible": True, "openToWork": True,
         "employmentStatus": emp, "currentTitle": title, "currentOrg": org, "createdAt": created,
         "impact": [{"date": created, "status": emp, "title": title, "org": org, "source": "Application"}]}
    d.update(acct(i))
    return d

M = {}
def add(m): M[m["dsnId"]] = m

add(member(1,"DSN-2023-0412","Adaeze Okafor","Female","Lagos",
 "Data Scientist · credit risk & forecasting",
 "Data scientist with five years of experience building credit-scoring and demand-forecasting models for Nigerian fintech and retail. Comfortable taking a problem from messy data to a deployed model and explaining the result to business teams.",
 ["Python","SQL","scikit-learn","XGBoost","Time series","Power BI","Airflow"],
 [{"company":"Kora Analytics Ltd","role":"Senior Data Scientist","start":"2023-03","end":"","current":True,"description":"Leads a team of three building credit-risk models for SME lending partners; cut default rate on approved loans by 18%."},
  {"company":"FreshMart Retail","role":"Data Scientist","start":"2021-01","end":"2023-02","current":False,"description":"Built weekly demand forecasts for 40 stores; reduced stock-outs on top SKUs by 22%."}],
 [{"title":"SME credit scoring model","link":"https://github.com/example/sme-credit","tools":"Python, XGBoost, SHAP","description":"Gradient-boosted scorecard on 120k loan records with explainability reports for credit officers.","outcome":"Adopted by two lending partners"},
  {"title":"Store demand forecasting","link":"https://github.com/example/forecast","tools":"Prophet, Airflow","description":"Automated weekly forecasts with drift monitoring.","outcome":"22% fewer stock-outs"},
  {"title":"Lagos traffic congestion analysis","link":"","tools":"Pandas, Kepler.gl","description":"Geospatial analysis of ride-hailing trips for a DSN hackathon.","outcome":"2nd place, DSN AI Summit Hackathon"}],
 [{"school":"University of Lagos","degree":"B.Sc.","field":"Statistics","year":"2018"},{"school":"University of Ibadan","degree":"M.Sc.","field":"Data Science","year":"2020"}],
 [{"name":"Google Advanced Data Analytics","issuer":"Coursera","year":"2022","link":""},{"name":"DSN AI Bootcamp — Distinction","issuer":"Data Science Nigeria","year":"2019","link":""}],
 ["2nd place, DSN AI Summit Hackathon 2021"],
 [{"role":"Data Scientist","level":"Senior","status":"verified","verifiedAt":"2026-06-14T10:00:00Z","verifiedBy":"RV-001","note":""},
  {"role":"Machine Learning Engineer","level":"Mid-Level","status":"claimed","note":""}],
 {"tech":17,"projects":16,"experience":16,"education":16,"soft":15},"reviewed",True,"Employed full-time","Senior Data Scientist","Kora Analytics Ltd","2026-02-10T09:00:00Z","2026-06-20T10:00:00Z"))

add(member(2,"DSN-2024-0187","Tunde Bakare","Male","Oyo",
 "Data Analyst · dashboards for public health",
 "Analyst who turns field data into dashboards that programme teams actually use. Two years with an NGO in Ibadan on immunisation and nutrition data.",
 ["Excel","SQL","Power BI","Kobo Toolbox","Python (basic)"],
 [{"company":"HealthReach Initiative","role":"Data Analyst","start":"2024-04","end":"","current":True,"description":"Maintains monthly immunisation dashboards across 12 LGAs; trained 30 field officers on data entry quality."},
  {"company":"DSN","role":"Data Science Intern","start":"2023-09","end":"2024-03","current":False,"description":"Cleaned and analysed survey data for community programmes."}],
 [{"title":"Immunisation coverage dashboard","link":"https://app.powerbi.com/example","tools":"Power BI, SQL","description":"LGA-level coverage tracking with automated monthly refresh.","outcome":"Used in monthly state review meetings"},
  {"title":"Survey cleaning toolkit","link":"https://github.com/example/kobo-clean","tools":"Python","description":"Scripts to clean KoboToolbox exports.","outcome":""}],
 [{"school":"Ladoke Akintola University of Technology","degree":"B.Tech.","field":"Computer Science","year":"2022"}],
 [{"name":"DSN AI Skills Week — Data Analysis track","issuer":"Data Science Nigeria","year":"2023","link":""},{"name":"Microsoft PL-300 Power BI Data Analyst","issuer":"Microsoft","year":"2025","link":""}],
 [],
 [{"role":"Data Analyst","level":"Junior","status":"verified","verifiedAt":"2026-07-02T10:00:00Z","verifiedBy":"RV-003","note":"Solid dashboard work; move to Mid-Level after more SQL depth."},
  {"role":"BI Analyst / BI Developer","level":"Junior","status":"pending","note":""}],
 {"tech":11,"projects":10,"experience":8,"education":11,"soft":13},"reviewed",False,"Employed full-time","Data Analyst","HealthReach Initiative","2026-03-01T09:00:00Z","2026-07-05T10:00:00Z"))

add(member(3,"DSN-2023-0958","Halima Yusuf","Female","Kaduna",
 "Machine Learning Engineer · NLP for Hausa",
 "ML engineer focused on speech and text models for Nigerian languages. Builds and deploys models on modest hardware budgets.",
 ["Python","PyTorch","Hugging Face","FastAPI","Docker","NLP"],
 [{"company":"Arewa Language Lab","role":"Machine Learning Engineer","start":"2022-06","end":"","current":True,"description":"Trained and deployed a Hausa ASR model serving 8k requests a day."},
  {"company":"Freelance","role":"ML Consultant","start":"2021-01","end":"2022-05","current":False,"description":"Text classification projects for two media houses."}],
 [{"title":"Hausa speech recognition","link":"https://huggingface.co/example/hausa-asr","tools":"PyTorch, wav2vec2","description":"Fine-tuned ASR model with 19% WER on held-out set.","outcome":"In production"},
  {"title":"News topic classifier","link":"https://github.com/example/news-clf","tools":"Transformers, FastAPI","description":"Multi-label classifier for Hausa news.","outcome":""},
  {"title":"Model serving template","link":"https://github.com/example/serve","tools":"Docker, FastAPI","description":"Lightweight serving template for CPU inference.","outcome":""}],
 [{"school":"Ahmadu Bello University","degree":"B.Eng.","field":"Electrical Engineering","year":"2020"}],
 [{"name":"Deep Learning Specialization","issuer":"DeepLearning.AI","year":"2021","link":""},{"name":"DSN Women in AI Fellowship","issuer":"Data Science Nigeria","year":"2022","link":""}],
 ["Speaker, Deep Learning Indaba 2025"],
 [{"role":"Machine Learning Engineer","level":"Mid-Level","status":"verified","verifiedAt":"2026-05-11T10:00:00Z","verifiedBy":"RV-001","note":""},
  {"role":"AI Researcher","level":"Junior","status":"claimed","note":""}],
 {"tech":16,"projects":15,"experience":12,"education":12,"soft":13},"reviewed",False,"Employed full-time","Machine Learning Engineer","Arewa Language Lab","2026-01-20T09:00:00Z","2026-05-15T10:00:00Z"))

add(member(4,"DSN-2025-0033","Chinedu Eze","Male","Enugu",
 "Data Engineer · pipelines and warehousing",
 "Data engineer who moved from backend development. Builds batch pipelines and warehouse models on GCP.",
 ["Python","SQL","dbt","BigQuery","Airflow","GCP"],
 [{"company":"Paylink Africa","role":"Data Engineer","start":"2024-02","end":"","current":True,"description":"Built the dbt models behind finance reporting; migrated 30 pipelines to Airflow."},
  {"company":"Softcraft Studio","role":"Backend Developer","start":"2021-07","end":"2024-01","current":False,"description":"Node.js APIs and Postgres."}],
 [{"title":"Finance reporting warehouse","link":"","tools":"dbt, BigQuery","description":"Star schema for daily revenue reporting.","outcome":"Reporting time cut from 2 days to 2 hours"}],
 [{"school":"University of Nigeria, Nsukka","degree":"B.Sc.","field":"Computer Science","year":"2021"}],
 [{"name":"Google Cloud Professional Data Engineer","issuer":"Google Cloud","year":"2025","link":""}],
 [],
 [{"role":"Data Engineer","level":"Mid-Level","status":"pending","note":""},{"role":"Analytics Engineer","level":"Junior","status":"claimed","note":""}],
 {"tech":5,"projects":5,"experience":5,"education":5,"soft":5},"pending",False,"Employed full-time","Data Engineer","Paylink Africa","2026-08-12T09:00:00Z"))

add(member(5,"DSN-2024-0761","Funmilayo Adeyemi","Female","Lagos",
 "Business Analyst · retail banking",
 "Business analyst translating customer and operations data into product decisions for retail banking.",
 ["Excel","SQL","Tableau","Requirements gathering","Process mapping"],
 [{"company":"Heritage Mutual Bank","role":"Business Analyst","start":"2022-10","end":"","current":True,"description":"Owns reporting for the mobile app channel; led requirements for a new onboarding flow."}],
 [{"title":"Mobile onboarding funnel analysis","link":"","tools":"SQL, Tableau","description":"Identified the three steps causing 60% of drop-off.","outcome":"Onboarding completion up 14%"},
  {"title":"Branch queue study","link":"","tools":"Excel","description":"Time-and-motion study across 6 branches.","outcome":""}],
 [{"school":"Obafemi Awolowo University","degree":"B.Sc.","field":"Economics","year":"2019"}],
 [{"name":"IIBA ECBA","issuer":"IIBA","year":"2023","link":""},{"name":"DSN AI Academy — Data Analytics","issuer":"Data Science Nigeria","year":"2022","link":""}],
 [],
 [{"role":"Business Analyst","level":"Mid-Level","status":"verified","verifiedAt":"2026-04-02T10:00:00Z","verifiedBy":"RV-003","note":""}],
 {"tech":12,"projects":11,"experience":13,"education":12,"soft":16},"reviewed",True,"Employed full-time","Business Analyst","Heritage Mutual Bank","2026-01-05T09:00:00Z","2026-04-05T10:00:00Z"))

add(member(6,"DSN-2025-0290","Ibrahim Musa","Male","FCT Abuja",
 "Aspiring Data Analyst",
 "Recent graduate from the DSN AI Bootcamp looking for a first analyst role. Strong in Excel and learning SQL.",
 ["Excel","SQL (learning)","Google Sheets"],
 [],
 [{"title":"Abuja rent price analysis","link":"https://github.com/example/abuja-rent","tools":"Excel, Python","description":"Scraped and analysed 3,000 listings.","outcome":""}],
 [{"school":"University of Abuja","degree":"B.Sc.","field":"Mathematics","year":"2024"}],
 [{"name":"DSN AI Bootcamp","issuer":"Data Science Nigeria","year":"2025","link":""}],
 [],
 [{"role":"Data Analyst","level":"Junior","status":"claimed","note":""}],
 {"tech":5,"projects":5,"experience":5,"education":5,"soft":5},"default",False,"Unemployed – seeking work","","","2026-09-01T09:00:00Z"))
M["DSN-2025-0290"]["impact"].append({"date":"2026-09-20T09:00:00Z","status":"Internship","title":"Data Analytics Intern","org":"Kora Analytics Ltd","source":"Member update"})
M["DSN-2025-0290"]["employmentStatus"]="Internship"; M["DSN-2025-0290"]["currentTitle"]="Data Analytics Intern"; M["DSN-2025-0290"]["currentOrg"]="Kora Analytics Ltd"
M["DSN-2024-0187"]["impact"][0]["status"]="Unemployed – seeking work"; M["DSN-2024-0187"]["impact"][0]["title"]=""; M["DSN-2024-0187"]["impact"][0]["org"]=""
M["DSN-2024-0187"]["impact"].append({"date":"2026-04-01T09:00:00Z","status":"Employed full-time","title":"Data Analyst","org":"HealthReach Initiative","source":"Member update"})

applications = {
 "DSN-2025-0412": {"dsnId":"DSN-2025-0412","name":"Ngozi Nwosu","email":"ngozi@example.com","phone":"0803 000 0000","gender":"Female","ageRange":"25–34","state":"Anambra",
   "employmentStatus":"Unemployed – seeking work","currentTitle":"","currentOrg":"","sector":"","yearsExp":"1–2 years","education":"Bachelor's degree",
   "programmes":["AI Bootcamp","Women in AI"],"primaryRole":"Data Scientist","otherRoles":["Data Analyst"],"linkedin":"",
   "dsnImpact":"The bootcamp gave me my first real ML project and a mentor.","goals":"A junior data science role in fintech.","status":"pending","createdAt":"2026-09-24T11:20:00Z","consent":True},
 "DSN-2024-1120": {"dsnId":"DSN-2024-1120","name":"Emeka Obi","email":"emeka@example.com","phone":"0812 000 0000","gender":"Male","ageRange":"25–34","state":"Rivers",
   "employmentStatus":"Self-employed / Freelance","currentTitle":"Freelance BI Developer","currentOrg":"","sector":"Oil & gas","yearsExp":"3–5 years","education":"Bachelor's degree",
   "programmes":["AI Skills Week"],"primaryRole":"BI Analyst / BI Developer","otherRoles":["Data Engineer"],"linkedin":"",
   "dsnImpact":"Skills Week helped me move from Excel reporting to Power BI and SQL.","goals":"Full-time BI role or steady contracts.","status":"pending","createdAt":"2026-09-26T15:05:00Z","consent":True},
}

reviewers = {
 "RV-001": {"id":"RV-001","name":"Dr. Kemi Adebayo","email":"kemi@example.com","expertise":"Machine learning, data science","canRole":True,"canRating":False,"active":True,"createdAt":"2026-01-10T09:00:00Z", **acct(21)},
 "RV-002": {"id":"RV-002","name":"Samuel Oladipo","email":"samuel@example.com","expertise":"Credentials & interviews (all data roles)","canRole":False,"canRating":True,"active":True,"createdAt":"2026-01-10T09:00:00Z", **acct(22)},
 "RV-003": {"id":"RV-003","name":"Amina Bello","email":"amina@example.com","expertise":"Analytics, BI, business analysis","canRole":True,"canRating":True,"active":True,"createdAt":"2026-02-01T09:00:00Z", **acct(23)},
}

recruiters = {
 "RC-1001": {"id":"RC-1001","company":"Kora Analytics Ltd","contactName":"Bola Ajayi","email":"talent@kora.example","phone":"","industry":"Fintech","size":"51–200","needs":"Data scientists and ML engineers","status":"approved","subscribed":True,"subscribedUntil":"2027-03-31","subRequested":False,"createdAt":"2026-03-02T09:00:00Z", **acct(31)},
 "RC-1002": {"id":"RC-1002","company":"Lagos Fintech Hub","contactName":"Yemi Cole","email":"yemi@lfh.example","phone":"","industry":"Technology hub","size":"11–50","needs":"Junior analysts for partner startups","status":"approved","subscribed":False,"subscribedUntil":"","subRequested":True,"createdAt":"2026-08-15T09:00:00Z", **acct(32)},
 "RC-1003": {"id":"RC-1003","company":"GreenField Agro","contactName":"Musa Garba","email":"musa@greenfield.example","phone":"","industry":"Agriculture","size":"201–1000","needs":"Data engineer","status":"pending","subscribed":False,"subscribedUntil":"","subRequested":False,"createdAt":"2026-09-25T09:00:00Z", **acct(33)},
}

requests = {
 "RQ-role-0001": {"id":"RQ-role-0001","type":"role","memberId":"DSN-2025-0033","role":"Data Engineer","level":"Mid-Level","status":"submitted","createdAt":"2026-09-18T10:00:00Z","reviewerId":"","history":[{"at":"2026-09-18T10:00:00Z","by":"member","text":"Verification requested; documents emailed."}]},
 "RQ-role-0002": {"id":"RQ-role-0002","type":"role","memberId":"DSN-2024-0187","role":"BI Analyst / BI Developer","level":"Junior","status":"interview","createdAt":"2026-09-10T10:00:00Z","reviewerId":"RV-003",
   "interview":{"when":"2026-10-02T14:00","link":"https://meet.google.com/abc-defg-hij","note":"Please be ready to walk through one dashboard you built end to end."},
   "history":[{"at":"2026-09-10T10:00:00Z","by":"member","text":"Verification requested; documents emailed."},{"at":"2026-09-15T12:00:00Z","by":"RV-003","text":"Interview requested for 2 Oct 2026, 14:00."}]},
 "RQ-rate-0003": {"id":"RQ-rate-0003","type":"rating","memberId":"DSN-2025-0033","status":"submitted","createdAt":"2026-09-18T10:05:00Z","reviewerId":"","history":[{"at":"2026-09-18T10:05:00Z","by":"member","text":"Profile submitted for rating review; documents emailed."}]},
 "RQ-role-0000": {"id":"RQ-role-0000","type":"role","memberId":"DSN-2023-0412","role":"Data Scientist","level":"Senior","status":"completed","createdAt":"2026-06-01T10:00:00Z","reviewerId":"RV-001","completedAt":"2026-06-14T10:00:00Z",
   "outcome":{"action":"verified","role":"Data Scientist","level":"Senior","note":"Strong evidence across three production models."},
   "history":[{"at":"2026-06-01T10:00:00Z","by":"member","text":"Verification requested; documents emailed."},{"at":"2026-06-14T10:00:00Z","by":"RV-001","text":"Verified as Data Scientist · Senior."}]},
}

talentRequests = {
 "TR-0001": {"id":"TR-0001","recruiterId":"RC-1001","company":"Kora Analytics Ltd","roleNeeded":"Data Analyst","level":"Junior","count":2,"engagement":"Full-time","workMode":"Hybrid (Lagos)","duration":"Permanent","budget":"₦400k–₦550k / month","description":"Two junior analysts for our lending operations team. SQL and Power BI required.","specific":["DSN-2024-0187"],"status":"shortlisting","shortlist":["DSN-2024-0187"],"adminNote":"Checking availability with shortlisted members.","createdAt":"2026-09-20T09:00:00Z"},
}

views = {
 "DSN-2024-0187__RC-1001": {"memberId":"DSN-2024-0187","recruiterId":"RC-1001","company":"Kora Analytics Ltd","count":3,"lastAt":"2026-09-21T10:00:00Z"},
 "DSN-2023-0412__RC-1001": {"memberId":"DSN-2023-0412","recruiterId":"RC-1001","company":"Kora Analytics Ltd","count":1,"lastAt":"2026-09-12T10:00:00Z"},
 "DSN-2024-0761__RC-1001": {"memberId":"DSN-2024-0761","recruiterId":"RC-1001","company":"Kora Analytics Ltd","count":2,"lastAt":"2026-09-19T10:00:00Z"},
}

seed = {"settings":{"main":settings},"members":M,"applications":applications,"reviewers":reviewers,"recruiters":recruiters,"requests":requests,"talentRequests":talentRequests,"views":views}
json.dump(seed, open("scripts/seed.json","w"), ensure_ascii=False)
print({k:len(v) for k,v in seed.items()})
