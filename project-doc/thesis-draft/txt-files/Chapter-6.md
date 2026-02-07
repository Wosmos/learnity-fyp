# Chapter 6: RESULTS AND CONCLUSION

## 6.1 RESULTS

The primary goal of this Final Year Project was to bridge the educational gap in Sindh by creating "Learnity," a localized, technology-driven learning platform. It can be confidently stated that this goal has been achieved.

We successfully developed a system where:

- **Students** can access the Sindh Board curriculum from their homes using low-bandwidth connections, addressing the 45.7% internet penetration rate in Pakistan [1].
- **Teachers** have a verified platform to monetize their skills and conduct live classes, tapping into the $11.15 billion global online tutoring market [2].
- **Engagement** is driven by gamification (XP and Streaks), validated by research showing a 30% increase in motivation [3].

Technologically, the use of Next.js and Serverless PostgreSQL proved to be robust choices capable of handling real-time interactions without crashing.

## 6.2 CONCLUSION

The "Digital Divide" in Pakistan is not just about a lack of internet; it is about a lack of _relevant content_. Learnity fills this void.

This project has taught us that building an EdTech platform is not just about writing code; it is about understanding user psychology. By integrating real-time video (100ms) and chat (GetStream), we transformed a static website into a thriving community. The platform provides easy navigation, secure authentication, and a scalable database structure that can grow with the user base.

Most importantly, Learnity demonstrates that high-quality educational infrastructure can be built on a student budget using modern "Serverless" technologies, providing a blueprint for future digital sovereignty in Pakistan’s education sector.

## 6.3 LIMITATIONS

Like any software project, Learnity has room for improvement. Due to the time constraints of the academic year, we encountered the following limitations:

- **Simulated Payments:** We could not integrate a live banking API (JazzCash/EasyPaisa) due to regulatory requirements for student projects. Payments currently require manual screenshot verification.
- **No Native Mobile App:** While the website is a Progressive Web App (PWA) and works well on phones, it is not a native Android (`.apk`) or iOS app, which limits push notification capabilities.
- **Manual Moderation:** Content moderation is currently manual. As the platform grows, relying on Admins to check every video will become a bottleneck.

## 6.4 FUTURE RECOMMENDATIONS

To make Learnity a commercially viable product in the future, we recommend the following enhancements:

1.  **AI-Powered Personalization:** Implementing an AI tutor that analyzes a student's quiz scores to recommend specific lessons they are weak in.
2.  **Native Mobile Applications:** Developing React Native apps for Android and iOS to support offline video downloads and better push notifications.
3.  **Automated Moderation:** Integrating AI/ML visual analysis tools to automatically flag inappropriate content in videos before they are published.
4.  **Parental Dashboard:** Adding a portal for parents to view their child's attendance and quiz performance via SMS alerts.

## 6.5 REFERENCES

[1] Pakistan Telecommunication Authority, "Annual Report 2024-25," Islamabad, Pakistan, 2024. [Online]. Available: https://www.pta.gov.pk/en/annual-reports. [Accessed: Feb. 6, 2026].

[2] The Business Research Company, "Online Tutoring Global Market Report 2024," _Market Research Report_, Jan. 2024. [Online]. Available: https://www.thebusinessresearchcompany.com/report/online-tutoring-global-market-report. [Accessed: Feb. 6, 2026].

[3] J. Hamari, J. Koivisto, and H. Sarsa, "Does Gamification Work? -- A Literature Review of Empirical Studies on Gamification," in _Proceedings of the 47th Hawaii International Conference on System Sciences_, Hawaii, USA, 2014, pp. 3025-3034. doi: 10.1109/HICSS.2014.377. Available: https://ieeexplore.ieee.org/document/6758978

[4] E. Dale, _Audiovisual Methods in Teaching_, 3rd ed. New York: Holt, Rinehart & Winston, 1969.

[5] Government of Pakistan, "Chapter 10: Education," in _Pakistan Economic Survey 2023-24_, Islamabad: Ministry of Finance, 2024. [Online]. Available: https://finance.gov.pk/survey/chapter_24/10_education.pdf. [Accessed: Feb. 6, 2026].

[6] UNESCO, "Global Education Monitoring Report 2023: Technology in education: A tool on whose terms?," Paris, UNESCO, 2023. [Online]. Available: https://www.unesco.org/gem-report/en/technology. [Accessed: Feb. 6, 2026].

[7] Vercel, "Next.js App Router Documentation," _Next.js Docs_. [Online]. Available: https://nextjs.org/docs/app-router. [Accessed: Feb. 6, 2026].

[8] PostgreSQL Global Development Group, "Transaction Isolation," _PostgreSQL 16 Documentation_. [Online]. Available: https://www.postgresql.org/docs/current/transaction-iso.html. [Accessed: Feb. 6, 2026].

[9] Stream.io Inc., "Build Engaging Remote Learning Environments," _GetStream Docs_. [Online]. Available: https://getstream.io/chat/docs/. [Accessed: Feb. 6, 2026].

[10] 100ms Inc., "100ms Video SDK Documentation," _100ms Docs_. [Online]. Available: https://www.100ms.live/docs/. [Accessed: Feb. 6, 2026].

[11] S. Deterding et al., "From Game Design Elements to Gamefulness: Defining Gamification," in _Proceedings of the 15th International Academic MindTrek Conference_, Tampere, Finland, 2011, pp. 9-15.
