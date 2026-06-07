// Popup functionality
class PopupManager {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    // Create popup overlay
    this.createOverlay();
    
    // Add click listeners to all clickable items
    this.addClickListeners();
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.closePopup();
      }
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'popup-overlay';
    this.overlay.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <div class="popup-logo-container">
            <img class="popup-logo" src="" alt="" />
          </div>
          <h2 class="popup-title"></h2>
          <button class="popup-close" type="button" aria-label="Close">&times;</button>
        </div>
        <div class="popup-body"></div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Add event listeners
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closePopup();
      }
    });
    
    this.overlay.querySelector('.popup-close').addEventListener('click', () => {
      this.closePopup();
    });
  }

  addClickListeners() {
    // Handle existing popup icons with data-popup-type attribute
    document.querySelectorAll('.popup-icon[data-popup-type]').forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const popupType = icon.getAttribute('data-popup-type');
        this.handleSpecialPopup(popupType);
      });
    });

    // Handle rev-icon elements with data-popup-type attribute (for preprint unavailable)
    document.querySelectorAll('.rev-icon[data-popup-type]').forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const popupType = icon.getAttribute('data-popup-type');
        this.handleSpecialPopup(popupType);
      });
    });

    // Add popup icons to numbered tables ONLY (publications, projects, outreach)
    // Explicitly exclude tables with no-numbers class
    document.querySelectorAll('.numbered-table').forEach(table => {
      // Skip tables with no-numbers class (education and experience sections)
      if (table.classList.contains('no-numbers')) return;
      
      table.querySelectorAll('.content-col').forEach(item => {
        // Skip if already has popup icon
        if (item.querySelector('.popup-icon')) return;
        
        this.addPopupIcon(item, () => {
          const title = item.textContent.replace('ⓘ', '').trim();
          const content = this.getPublicationContent(title);
          this.showPopup(title, content);
        });
      });
    });

    // Add popup functionality to education and experience sections
    // These sections have dedicated icon columns, so we add click handlers to existing popup icons
    document.querySelectorAll('.numbered-table.no-numbers').forEach(table => {
      table.querySelectorAll('tr').forEach(row => {
        const contentCol = row.querySelector('.content-col');
        const iconCol = row.querySelector('.icon-col');
        const popupIcon = iconCol?.querySelector('.popup-icon');
        
        if (contentCol && popupIcon) {
          // Remove any existing click handlers and add new one
          popupIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const title = contentCol.textContent.replace('ⓘ', '').replace('-', '').trim();

            // Determine content type based on section
            const section = table.closest('section');
            let content;

            if (section && section.id === 'education') {
              content = this.getCertificateContent(title);
            } else if (section && section.id === 'experience') {
              content = this.getExperienceContent(title);
            } else {
              content = this.getPublicationContent(title);
            }

            const displayTitle = popupIcon.dataset.popupTitle || title;
            const logoSrc = popupIcon.dataset.popupLogo || null;
            this.showPopup(displayTitle, content, logoSrc);
          });
        }

        const listIcon = iconCol?.querySelector('.list-icon');
        if (contentCol && listIcon) {
          listIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const title = contentCol.textContent.replace('ⓘ', '').replace('-', '').trim();
            const cleanTitle = title.replace(/^-\s*/, '').split(' | ')[0].trim();
            const displayTitle = listIcon.dataset.popupTitle || cleanTitle;
            const content = this.getListContent(cleanTitle);
            this.showPopup(displayTitle, content);
          });
        }
      });
    });
  }

  addPopupIcon(element, clickHandler) {
    // Create popup icon
    const popupIcon = document.createElement('span');
    popupIcon.className = 'popup-icon';
    popupIcon.title = 'View details';
    popupIcon.setAttribute('aria-label', 'View details');
    
    // Add click handler to icon
    popupIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clickHandler();
    });
    
    // Append icon directly to the element
    element.appendChild(popupIcon);
  }

  handleSpecialPopup(popupType) {
    switch (popupType) {
      case 'preprint-unavailable':
        this.showPopup(
          'Preprint Information',
          '<p>Preprint unavailable due to the publisher\'s double-blinded peer review policies.</p>'
        );
        break;
      case 'entry-pending':
        this.showPopup(
          'Entry Pending',
          '<p>Details for this entry are currently being prepared.</p>'
        );
        break;
      case 'hgsm-study-tour':
        this.showPopup(
          'Korea Home Grown School Meals Study Tour',
          `<h3>Program Overview</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;width:25%;vertical-align:top;">Program Title</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">WBG Home Grown School Meals Study Tour</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Organizing Body</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">World Bank Group (WBG)</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Duration</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Five (5) days — 18 May (Mon) to 22 May (Fri), 2026</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Host Country</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Republic of Korea</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Itinerary</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Seoul → Wanju → Naju → Jeonju → Sejong → Seoul</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Participating Countries</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Republic of Zambia; Republic of Madagascar</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Total Participants</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">26 persons (Government Officials, WBG Staff, WFP Staff)</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);font-weight:600;vertical-align:top;">Program Objectives</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">To enhance participants' understanding of Korea's school meal policy framework, financing mechanisms, operational systems, and food safety governance; to explore institutional and technical applicability in participating African countries; and to strengthen capacity for improved nutrition, local agricultural linkages, and sustainable school feeding systems.</td></tr>
            </tbody>
          </table>

          <h3 style="margin-top:36px;">Background and Purpose</h3>
          <p>The study tour is conducted under the auspices of the World Bank Group's program for strengthening school feeding policy capacity in Sub-Saharan Africa. Both Zambia and Madagascar are at critical junctures in expanding and institutionalising their national school feeding programs. The program is implemented in close collaboration with the World Food Programme (WFP) and World Bank country offices to maximise the translation of study tour findings into domestic policy action.</p>

          <h3 style="margin-top:36px;">Day 1 — Monday, 18 May 2026</h3>
          <p style="font-style:italic;color:var(--muted);margin-bottom:8px;">Seoul, Republic of Korea</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:18%;border:1px solid #5e717d;">Time</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:30%;border:1px solid #5e717d;">Session</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">09:00–09:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Opening Session</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Formal welcome and introductory remarks by the World Bank Group team.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">09:30–10:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Orientation</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Introduction to host institutions, program objectives, and institutional focal points for each site visit.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">10:00–12:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Expert Lecture — Overview of Korea's School Meal System</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Delivered by Dr. Yoon Sangchul (Korea Catholic University). 75-minute presentation on historical development, policy framework, financing structure, and food safety governance, followed by a 45-minute open discussion.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">12:00–13:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Lunch</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">14:00–15:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Seoul Metropolitan Office of Education</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Roundtable chaired by the Deputy Superintendent of Education, examining Korea's development trajectory from low-income country to universal free provision as a case of institutional aspiration.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">16:00–17:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Eunpyeong-gu Children's & Social Welfare Foodservice Management Center</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Focus on technical guidance and administrative training for nutrition management, hygiene, and food safety practices.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">18:00–19:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Welcome Dinner</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
            </tbody>
          </table>

          <h3 style="margin-top:36px;">Day 2 — Tuesday, 19 May 2026</h3>
          <p style="font-style:italic;color:var(--muted);margin-bottom:8px;">Wanju, North Jeolla Province — Focus: Local Food Systems</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:18%;border:1px solid #5e717d;">Time</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:30%;border:1px solid #5e717d;">Session</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">08:00–10:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Transfer to Wanju</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Coach transfer, approximately two (2) hours.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">10:00–11:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Hanil Highschool</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Structured visit to observe school meal delivery and preparation. Roundtable with school principal and technical discussion with the school nutritionist.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">12:00–13:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Lunch</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">13:00–15:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Wanju Food Integration Centre & Local Food Team</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Guided tour of intake, inspection, sorting, packaging, and dispatch facilities, followed by a structured dialogue on operational architecture and farmer participation conditions.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">15:00–16:40</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Local Farm Walking Tour & Agri-Food Processing Facility</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Walking tour tracing the production-to-centre supply chain, followed by a visit to a surplus agri-food processing facility illustrating food loss reduction and value-addition mechanisms.</td></tr>
            </tbody>
          </table>

          <h3 style="margin-top:36px;">Day 3 — Wednesday, 20 May 2026</h3>
          <p style="font-style:italic;color:var(--muted);margin-bottom:8px;">Naju, South Jeolla Province — Focus: National Systems</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:18%;border:1px solid #5e717d;">Time</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:30%;border:1px solid #5e717d;">Session</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">08:00–09:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Transfer to Naju</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Coach transfer (~90 min), accompanied by an official from the Ministry of Agriculture, Food and Rural Affairs.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">09:30–11:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">aT — Integrated Local Food Direct Sales Centre & School Meal Support Centre</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Field visit observing intake and display of locally sourced agricultural produce, with briefing on operational linkages among rural revitalization, local food policy, and public school feeding procurement.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">12:00–13:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Lunch</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">13:00–15:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Korea Agro-Fisheries & Food Trade Corporation (aT)</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Overview of aT's four functional divisions, demonstration of the neaT and seaT digital procurement systems, and roundtable with the Director of the Public Food Division.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">15:30–17:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Korea Rural Economic Institute (KREI)</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Expert lecture by Dr. Eunmi Jeong on direct agricultural trade and local food distribution structures, followed by a one-hour research roundtable.</td></tr>
            </tbody>
          </table>

          <h3 style="margin-top:36px;">Day 4 — Thursday, 21 May 2026</h3>
          <p style="font-style:italic;color:var(--muted);margin-bottom:8px;">Sejong — Focus: Policy Dialogues</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <thead><tr>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:18%;border:1px solid #5e717d;">Time</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:30%;border:1px solid #5e717d;">Session</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">09:15–11:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">NAAS / KOPIA</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Introduction to the "RicePia" African rice seed initiative, roundtable on agricultural cooperation, and presentation on Korea's rural modernization and agricultural extension systems.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">12:45–13:45</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Lunch</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">13:45–15:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Ministry of Education — Student Health Policy Division</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Policy dialogue on the national school meals policy framework and the multi-tier budget structure (Ministry of Education → Provincial Education Office → Local Government → School), with informal policy exchange.</td></tr>
            </tbody>
          </table>

          <h3 style="margin-top:36px;">Day 5 — Friday, 22 May 2026</h3>
          <p style="font-style:italic;color:var(--muted);margin-bottom:8px;">Seoul, Republic of Korea — Closing</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:0;">
            <thead><tr>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:18%;border:1px solid #5e717d;">Time</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;width:30%;border:1px solid #5e717d;">Session</th>
              <th style="padding:7px 10px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">08:50–11:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Expert Workshop</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Delegation teams consolidate key lessons, define a one-year localization roadmap, and develop country-specific action plans through brainstorming, peer review, and expert technical consultation.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">11:00–11:30</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Country Presentation (Zambia)</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Presentations by Zambian government officials from Ministries of Education and Agriculture, outlining proposed strategies for applying study tour findings domestically.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">11:30–12:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Country Presentation (Madagascar)</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">Presentations by Malagasy government officials from Ministries of Education and Agriculture, outlining proposed strategies for applying study tour findings domestically.</td></tr>
              <tr><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;">12:00–13:00</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;font-weight:600;">Networking Lunch</td><td style="padding:7px 10px;border:1px solid var(--border);vertical-align:top;"></td></tr>
            </tbody>
          </table>`
        );
        break;
      default:
        console.warn('Unknown popup type:', popupType);
    }
  }

  showPopup(title, content, logoSrc) {
    const titleElement = this.overlay.querySelector('.popup-title');
    const bodyElement = this.overlay.querySelector('.popup-body');
    const logoContainer = this.overlay.querySelector('.popup-logo-container');
    const logoImg = this.overlay.querySelector('.popup-logo');

    if (logoSrc) {
      logoImg.src = logoSrc;
      logoImg.alt = title;
      logoContainer.style.display = 'flex';
    } else {
      logoContainer.style.display = 'none';
      logoImg.src = '';
    }
    
    // Extract clean title without author names and publication details
    let cleanTitle = title;
    
    // For publications, extract just the main title
    if (title.includes(',')) {
      // Find the pattern like "Title, Journal Name" or similar
      const titleMatch = title.match(/\([^)]*\),\s*([^,]+(?:,[^,]*)*?),\s*<em>/);
      if (titleMatch) {
        cleanTitle = titleMatch[1].trim();
      } else {
        // Fallback: try to extract everything between year and journal
        const yearMatch = title.match(/\([^)]*\),\s*([^<]+)/);
        if (yearMatch) {
          cleanTitle = yearMatch[1].split(',')[0].trim();
        }
      }
    }
    
    // For experience items, clean up the format
    if (title.includes('|') || title.startsWith('-')) {
      cleanTitle = title.replace(/^-\s*/, '').split('|')[0].trim();
    }
    
    titleElement.textContent = cleanTitle;
    
    // Only clear body content if no content is provided (for title-only popups)
    if (content) {
      bodyElement.innerHTML = content;
    } else {
      bodyElement.innerHTML = ''; // Remove body content - show only title
    }
    
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closePopup() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  getExperienceContent(title) {
    // Normalize non-breaking spaces and strip leading dash/whitespace
    const cleanTitle = title.replace(/ /g, ' ').replace(/^[-\s]+/, '').trim();

    const experiences = {
      'Assistant Officer | Trade and Investment Unit, ASEAN-Korea Centre': `
        <h3>Organization Overview</h3>
        <p>The ASEAN-Korea Centre is an intergovernmental organization established by the governments of ASEAN Member States and the Republic of Korea to promote economic cooperation, trade and investment, sustainable development, cultural exchange, and people-to-people connectivity. Working at the intersection of diplomacy, development cooperation, and economic engagement, the Centre serves as a key platform for advancing ASEAN–Korea partnerships across the region.</p>

        <h3>Role Overview</h3>
        <p>As Program Officer within the Trade & Investment Unit, I lead the Sustainable Innovation Program, a KRW 270 million regional initiative designed to strengthen ASEAN–Korea cooperation in sustainable development, innovation, emerging technologies, and economic transformation. The role combines program leadership, policy research, stakeholder engagement, and economic diplomacy across governments, businesses, international organizations, and academic institutions.</p>

        <h3>Core Responsibilities</h3>
        <ul>
          <li>Lead the end-to-end design, management, implementation, and evaluation of the Sustainable Innovation Program</li>
          <li>Develop strategic partnerships with ASEAN governments, Korean ministries, embassies, international organizations, research institutions, and private-sector stakeholders</li>
          <li>Design and organize regional conferences, workshops, study visits, policy dialogues, and capacity-building programs</li>
          <li>Conduct policy research and produce analytical materials supporting ASEAN–Korea cooperation initiatives</li>
          <li>Facilitate diplomatic engagement with ASEAN embassies and government representatives in Korea</li>
          <li>Support trade and investment promotion activities connecting Korean and ASEAN businesses</li>
        </ul>

        <h3>Research and Policy Development</h3>
        <p>In addition to program management responsibilities, I conduct research on regional economic integration and ASEAN–Korea connectivity. My work focuses on energy transition, renewable energy cooperation, hydrogen development, supply-chain resilience, emissions trading systems, industrial decarbonization, and emerging sustainability challenges. These research activities inform the development of new cooperation initiatives and policy-oriented programs across the ASEAN region.</p>

        <h3>Trade and Economic Diplomacy</h3>
        <p>A significant component of my work involves facilitating cross-border business engagement and commercial cooperation between ASEAN and Korea.</p>
        <ul>
          <li>Organize and lead outbound trade missions for Korean companies to ASEAN Member States</li>
          <li>Coordinate business delegation programs involving government agencies, industry associations, and private-sector stakeholders</li>
          <li>Support inbound business missions and market-entry activities for ASEAN companies seeking opportunities in Korea</li>
          <li>Promote trade, investment, and business partnerships across strategic sectors including sustainability, energy, technology, and innovation</li>
        </ul>

        <h3>Representative Contributions</h3>
        <ul>
          <li>Led the development and implementation of the ASEAN-Korea Sustainable Innovation Program, managing all aspects of planning, stakeholder engagement, budgeting, and delivery</li>
          <li>Developed cooperation initiatives on AI governance, sustainable innovation, digital transformation, and technology policy</li>
          <li>Conducted policy research supporting ASEAN–Korea collaboration on energy transition, supply-chain security, emissions trading, and sustainable development</li>
          <li>Built and maintained working relationships with ASEAN embassies, government ministries, international organizations, research institutions, and industry partners</li>
          <li>Coordinated regional programs involving policymakers, academics, entrepreneurs, and development practitioners from across Southeast Asia and Korea</li>
        </ul>

        <h3>Impact</h3>
        <p>This role places me at the intersection of regional diplomacy, sustainable development, and economic cooperation. By leading large-scale ASEAN–Korea initiatives, supporting evidence-based policy development, and facilitating cross-border business engagement, I contribute to strengthening long-term partnerships between Korea and Southeast Asia while advancing shared goals in sustainability, innovation, and regional prosperity.</p>
      `,

      'Program Coordinator | Development Impact Evaluation, World Bank Group': `
        <h3>Organization Overview</h3>
        <p>The Development Impact Evaluation (DIME) unit of the World Bank Group works with governments and development partners to generate evidence that improves policy effectiveness and development outcomes. Through impact evaluations, policy research, and knowledge exchange initiatives, DIME supports evidence-based decision-making across sectors including education, agriculture, social protection, and sustainable development.</p>

        <h3>Role Overview</h3>
        <p>As Program Coordinator, I led the planning and implementation of international knowledge-exchange initiatives connecting Korean development experience with partner countries. My work focused on sustainable agriculture, food security, climate resilience, and policy learning, while also contributing to research and program activities under the Korea Green Growth Trust Fund (KGGTF).</p>

        <h3>Flagship Initiative: Home-Grown School Meals Study Tour</h3>
        <p>I served as the primary coordinator and program lead for the 2026 World Bank Home-Grown School Meals Study Tour, bringing together government officials from the Ministries of Education and Agriculture of Zambia and Madagascar, alongside representatives from the World Food Programme and Korean institutions.</p>
        <p>Responsibilities included:</p>
        <ul>
          <li>Designing and managing the program from concept development to implementation</li>
          <li>Identifying policy learning objectives and knowledge-sharing priorities with partner governments</li>
          <li>Researching relevant Korean policies, institutions, and best practices in school feeding, agricultural development, and food systems</li>
          <li>Developing agendas, technical sessions, field visits, and stakeholder engagement activities</li>
          <li>Coordinating with ministries, public institutions, research organizations, and development partners</li>
          <li>Managing budgets, logistics, scheduling, and operational implementation</li>
        </ul>

        <h3>Sustainable Agriculture and Food Systems</h3>
        <p>The program was designed to facilitate policy learning on how school meal systems can simultaneously support educational outcomes, local agricultural development, nutrition security, and rural livelihoods. Through engagement with Korean institutions, participating countries explored strategies for strengthening food-system resilience, supporting smallholder farmers, and improving long-term food security under changing environmental and climatic conditions.</p>

        <h3>Research and Analytical Contributions</h3>
        <p>In parallel with program coordination responsibilities, I supported analytical work under the Korea Green Growth Trust Fund and broader World Bank initiatives.</p>
        <p>Areas of contribution included:</p>
        <ul>
          <li>Analysis of environmental and sustainability-focused development projects within the Korea Green Growth Trust Fund portfolio</li>
          <li>Research on youth perceptions, adoption patterns, and sustainability implications of artificial intelligence</li>
          <li>Preparation of policy briefs, background materials, presentations, and event documentation</li>
          <li>Support for World Bank–Korea knowledge-sharing programs and stakeholder engagement activities</li>
        </ul>

        <h3>Representative Contributions</h3>
        <ul>
          <li>Led the end-to-end implementation of a multi-country policy-learning program involving African governments, international organizations, and Korean institutions</li>
          <li>Facilitated knowledge exchange on sustainable agriculture, food systems, nutrition, and climate resilience</li>
          <li>Conducted research and portfolio analysis related to green growth and environmental development initiatives</li>
          <li>Contributed to research examining the intersection of artificial intelligence, youth engagement, and sustainable development</li>
          <li>Supported high-level World Bank–Korea events, workshops, and development cooperation activities</li>
        </ul>

        <h3>Impact</h3>
        <p>This role provided practical experience at the intersection of international development, sustainability, and policy learning. By connecting government practitioners, development organizations, and technical experts across regions, I contributed to the exchange of knowledge on food security, agricultural resilience, and sustainable development while supporting broader World Bank initiatives on green growth and emerging technologies.</p>
      `,

      'Program Consultant | Global Programs Office, Dawa DC': `
        <h3>Organization Overview</h3>
        <p>Dawa DC develops international partnerships, knowledge-exchange initiatives, and strategic cooperation programs that connect Gulf stakeholders with global expertise across economic development, innovation, sustainability, and urban transformation. The office works with governments, businesses, and research institutions to identify opportunities that support long-term economic diversification and sustainable growth.</p>

        <h3>Role Overview</h3>
        <p>As Program Consultant, I led the development and implementation of international cooperation programs focused on economic diversification, industrial transformation, renewable energy, and sustainable development. Working primarily with stakeholders from the Gulf Cooperation Council (GCC) region, I supported government entities and business leaders in identifying strategies for reducing dependence on oil-based economies and fostering new sources of sustainable economic growth.</p>

        <h3>Economic Diversification and Sustainable Development</h3>
        <p>A major component of my work focused on researching and developing pathways for economic diversification beyond oil-dependent growth models. Through international benchmarking, stakeholder engagement, and policy analysis, I contributed to programs examining how emerging industries, clean technologies, and innovation ecosystems can strengthen long-term economic resilience and competitiveness.</p>
        <p>Key areas of focus included:</p>
        <ul>
          <li>Renewable energy and energy transition strategies</li>
          <li>Clean technology and sustainable industrial innovation</li>
          <li>Biotechnology and life sciences</li>
          <li>Healthcare and medical industries</li>
          <li>Innovation ecosystems and entrepreneurship</li>
          <li>Knowledge-based economic development</li>
          <li>Sustainable urban development and smart-city solutions</li>
        </ul>

        <h3>International Cooperation and Delegation Programs</h3>
        <p>I led the design and implementation of international study visits, government missions, and business engagement programs across Korea, Japan, China, Australia, and Europe.</p>
        <p>Responsibilities included:</p>
        <ul>
          <li>Conducting policy and industry research to identify international best practices and cooperation opportunities</li>
          <li>Designing customized programs aligned with government development priorities and sector-specific needs</li>
          <li>Developing agendas, technical sessions, stakeholder meetings, and institutional visits</li>
          <li>Building partnerships with government agencies, research institutes, universities, and private-sector organizations</li>
          <li>Managing budgets, logistics, stakeholder coordination, and end-to-end program delivery</li>
        </ul>

        <h3>Urban Development and Sustainability Initiatives</h3>
        <p>One of the flagship initiatives I managed involved supporting an official delegation from the Riyadh Municipal Government to Sydney, Australia, under the direction of H.E. the Deputy Mayor. The program focused on sustainable urban development, city governance, infrastructure planning, and smart-city strategies that could inform Saudi Arabia's long-term urban transformation agenda.</p>

        <h3>Representative Contributions</h3>
        <ul>
          <li>Developed international cooperation programs supporting economic diversification and post-oil development strategies across the GCC region</li>
          <li>Facilitated engagement between government officials, industry leaders, and international experts in renewable energy, clean technology, healthcare, manufacturing, and innovation</li>
          <li>Designed and implemented government and business delegations across Asia, Europe, and Australia</li>
          <li>Conducted policy research and strategic analysis on sustainable development, emerging industries, and economic transformation</li>
          <li>Supported senior government officials, municipal leaders, and business representatives through tailored knowledge-exchange programs</li>
          <li>Built partnerships with public institutions, research organizations, universities, and private-sector stakeholders to support international cooperation initiatives</li>
        </ul>

        <h3>Impact</h3>
        <p>This role provided direct experience at the intersection of economic development, sustainability, and international cooperation. By connecting policymakers and industry leaders with global expertise, I contributed to initiatives supporting economic diversification, renewable energy development, clean technology adoption, and sustainable urban transformation. The experience strengthened my understanding of how countries navigate structural transitions toward more resilient, innovative, and sustainable economic futures.</p>
      `,

      'Researcher, International Cooperation Division, Korea Development Institute (KDI)': `
        <h3>Role Overview</h3>
        <p>As a researcher at KDI's International Cooperation Division, I focus on policy analysis and international development cooperation initiatives.</p>
        
        <h3>Key Responsibilities</h3>
        <ul>
          <li>Conducting policy research on international cooperation strategies</li>
          <li>Supporting bilateral and multilateral development projects</li>
          <li>Analyzing global economic trends and their implications for Korea</li>
          <li>Contributing to KDI's flagship research publications</li>
        </ul>
        
        <h3>Notable Achievements</h3>
        <p>Leading research initiatives that bridge climate policy and international economic cooperation, with particular focus on sustainable development frameworks.</p>
      `,
      
      'Tracking and Recognition (Transparency) Analyst, UNFCCC': `
        <h3>Role Overview</h3>
        <p>Working remotely as a part-time transparency analyst for the United Nations Framework Convention on Climate Change, focusing on tracking and recognition systems for climate commitments.</p>
        
        <h3>Key Responsibilities</h3>
        <ul>
          <li>Analyzing national climate transparency reports and NDCs</li>
          <li>Supporting the development of tracking methodologies</li>
          <li>Contributing to UNFCCC transparency framework implementation</li>
          <li>Providing technical expertise on measurement, reporting, and verification (MRV)</li>
        </ul>
        
        <h3>Impact</h3>
        <p>Contributing to global climate transparency efforts and helping improve the accuracy and comparability of national climate reporting.</p>
      `,
      
      'Researcher | Climate & Energy Cooperation Center, Ministry of Foreign Affairs': `
        <h3>Organization Overview</h3>
        <p>The Climate & Energy Cooperation Center of the Korean Ministry of Foreign Affairs is an organization branched in the Climate Change Diplomacy Division, dedicated to supporting Korea's climate initiatives.</p>
        
        <h3>Key Responsibilities</h3>
        <ul>
          <li>Creating reports and briefings to inform climate negotiators</li>
          <li>Presenting Korea's initiatives to foreign entities</li>
          <li>Creating presentation materials for diplomatic missions</li>
          <li>Drafting concept notes and relevant materials for global sustainability missions</li>
          <li>Organizing and hosting seminars and conferences</li>
          <li>Translation services (Korean-English)</li>
          <li>Organizing field trips for foreign diplomats in Korea</li>
          <li>Supporting additional tasks assigned by the Ministry</li>
        </ul>
        
        <h3>Research Collaboration</h3>
        <p>Beyond core responsibilities, I collaborate with the Head of the Center on several research projects, resulting in manuscripts currently published and under review at reputable academic venues.</p>
        
        <h3>Key Achievements</h3>
        <ul>
          <li><strong>Diplomatic Support:</strong> Assisted 5+ high-level bilateral dialogues</li>
          <li><strong>Event Management:</strong> Organized and hosted 2 international conferences along with multiple closed-door seminars</li>
          <li><strong>Policy Analysis:</strong> Documented 8+ policy reports on latest climate and sustainability trends and data</li>
          <li><strong>Academic Output:</strong> Produced 2 SSCI papers (Q1), focusing on sustainable development and transboundary cooperation</li>
          <li><strong>Material Development:</strong> Created presentation and briefing materials for the ministry</li>
          <li><strong>Industrial Engagement:</strong> Organized industrial site inspections to Naver, KOWP, and other key organizations</li>
        </ul>
        
        <h3>Impact</h3>
        <p>This role positioned me at the intersection of climate diplomacy and academic research, contributing to Korea's international climate leadership while advancing scholarly understanding of transboundary climate cooperation.</p>
      `,
      
      'Sergeant | 703 Special Assault Commando, Republic of Korea Army': `
        <h3>Role Overview</h3>
        <p>Served as a Reconnaissance Commando (정찰특공병) in the 8th Company, 2nd Battalion of the 703rd Commando Regiment, an elite special operations unit under the Republic of Korea Army's III Corps responsible for rapid-response and special operations missions. Subsequently served as Squad Leader, overseeing personnel management, training, and operational readiness within a small-unit team.</p>
        <p>Successfully completed mandatory military service and was honorably discharged upon fulfillment of service obligations on February 4, 2019.</p>

        <h3>Key Responsibilities</h3>
        <ul>
          <li>Participated in reconnaissance, infiltration, and special operations training in mountainous and austere environments</li>
          <li>Led a squad-level team during training exercises and operational activities, ensuring mission readiness and unit cohesion</li>
          <li>Managed personnel welfare, accountability, and day-to-day leadership responsibilities as Squad Leader</li>
          <li>Conducted small-unit tactical exercises and field operations requiring high levels of discipline, coordination, and adaptability</li>
        </ul>

        <h3>Skills Developed</h3>
        <ul>
          <li>Team leadership and personnel management</li>
          <li>Decision-making under pressure</li>
          <li>Resilience and adaptability</li>
          <li>Accountability and responsibility</li>
          <li>Problem-solving in demanding environments</li>
          <li>Physical endurance and mental toughness</li>
        </ul>

        <h3>Impact</h3>
        <p>Military service provided valuable experience leading teams in high-pressure environments where trust, accountability, and mission execution were critical to success. Serving as Squad Leader strengthened my leadership, communication, and decision-making abilities while reinforcing the importance of teamwork and responsibility under challenging conditions.</p>
      `,

      'School Representative | Graduate Student Council, Hanyang University': `
        <h3>Role Overview</h3>
        <p>Served as an elected student representative, acting as a liaison between students, faculty, and the central student government. Represented student interests in discussions related to budgets, activities, academic affairs, and campus operations.</p>

        <h3>Key Contributions</h3>
        <ul>
          <li>Coordinated with the central student government on student initiatives and budget-related matters</li>
          <li>Addressed student concerns and facilitated communication between students and university administration</li>
          <li>Supported the integration and engagement of both domestic and international students</li>
          <li>Resolved operational and interpersonal challenges to maintain a positive and collaborative campus environment</li>
        </ul>

        <h3>Impact</h3>
        <p>Developed early experience in stakeholder management, conflict resolution, and community leadership while representing a diverse student body and fostering effective communication across the university.</p>
      `,

      'Researcher | Global Circular Economy Center, Hanyang University': `
        <h3>Organization Overview</h3>
        <p>The Global Circular Economy Center (GCEC) at Hanyang University was established in 2021 as the successor to the Energy Governance Center, which had operated since 2011 under the leadership of Professor Younkyoo Kim. The Center conducts interdisciplinary research on sustainability, circular economy, climate policy, energy transition, and environmental governance while supporting policy development and capacity-building initiatives for governments, international organizations, and private-sector partners.</p>

        <h3>Role Overview</h3>
        <p>During my Master's studies, I joined GCEC as a Researcher and became actively involved in the Center's research, project management, and institutional operations. Working across government-funded, international cooperation, and corporate projects, I contributed to the development of policy research and sustainability initiatives addressing climate change, circular economy, energy transition, and sustainable industrial development.</p>

        <h3>Research and Policy Development</h3>
        <p>My primary responsibilities focused on conducting policy-oriented research and supporting the development of large-scale projects related to environmental governance and sustainable development.</p>
        <p>Key areas of work included:</p>
        <ul>
          <li>Circular economy and resource efficiency</li>
          <li>Climate change mitigation and adaptation</li>
          <li>Energy transition and renewable energy policy</li>
          <li>Carbon markets and industrial decarbonization</li>
          <li>Sustainable consumption and behavioral change</li>
          <li>Environmental governance and public policy</li>
          <li>International development cooperation and knowledge sharing</li>
        </ul>

        <h3>Project Management and Coordination</h3>
        <p>In addition to research responsibilities, I supported the management and implementation of multiple government and corporate projects.</p>
        <p>Responsibilities included:</p>
        <ul>
          <li>Drafting research proposals, requests for proposals (RFPs), concept notes, and project documentation</li>
          <li>Conducting literature reviews, policy analysis, stakeholder mapping, and data collection</li>
          <li>Preparing presentations, policy briefs, technical reports, and final deliverables</li>
          <li>Managing research assistants and coordinating project workflows</li>
          <li>Organizing seminars, workshops, expert consultations, and stakeholder meetings</li>
          <li>Managing project budgets, administrative processes, and reporting requirements</li>
          <li>Facilitating communication with government agencies, public institutions, corporate partners, and international stakeholders</li>
          <li>Providing Korean-English translation and communication support</li>
        </ul>

        <h3>Representative Contributions</h3>
        <ul>
          <li>Contributed to five government-funded projects and multiple private-sector initiatives related to sustainability and environmental governance</li>
          <li>Supported international development and knowledge-sharing projects involving partner countries in Asia and Latin America</li>
          <li>Conducted research on climate policy, circular economy strategies, energy transition, and sustainable industrial development</li>
          <li>Assisted corporate sustainability and decarbonization projects involving major Korean industries</li>
          <li>Coordinated stakeholder engagement activities involving ministries, public institutions, academic experts, and private-sector organizations</li>
        </ul>

        <h3>Research Leadership and Mentorship</h3>
        <p>As project responsibilities expanded, I supervised and coordinated a team of research assistants, supporting project implementation, quality control, data collection, and report preparation. This experience strengthened my skills in project leadership, team management, and interdisciplinary collaboration.</p>

        <h3>Impact</h3>
        <p>This role provided the foundation for my subsequent work in international development, climate diplomacy, and regional cooperation. Through direct involvement in government, corporate, and international sustainability projects, I developed expertise in environmental policy analysis, project management, stakeholder engagement, and evidence-based policymaking. The experience also deepened my understanding of how sustainability challenges are translated into practical policy solutions across different institutional and national contexts.</p>
      `
    };
    
    return experiences[cleanTitle] || `
      <p>Detailed information about this position will be added soon. This role represents an important part of my professional journey in climate policy and sustainable development.</p>
    `;
  }

  getPublicationContent(title) {
    // Extract basic info from the title
    const hasKim = title.includes('Kim, T.');
    const year = title.match(/\((\d{4})\)/)?.[1] || 'Recent';
    
    return `
      <h3>Publication Details</h3>
      <p><strong>Role:</strong> ${hasKim ? 'Lead/Co-lead Author' : 'Contributing Author'}</p>
      <p><strong>Year:</strong> ${year}</p>
      
      <h3>Research Context</h3>
      <p>This publication contributes to the growing body of research on climate governance, environmental policy, and sustainable development. The work reflects interdisciplinary approaches combining policy analysis, behavioral economics, and environmental science.</p>
      
      <h3>Impact & Significance</h3>
      <p>This research addresses critical gaps in current literature and provides evidence-based insights for policymakers, researchers, and practitioners working on climate and sustainability challenges.</p>
      
      <p><em>Detailed abstract and key findings will be added to provide more specific information about this publication's contributions to the field.</em></p>
    `;
  }

  getCertificateContent(title) {
    // Clean title by removing dash and date information for matching
    const cleanTitle = title.replace(/^-\s*/, '').split(' | ')[0].trim();
    
    const certificates = {
      'M.A. in Environmental Policy': `
        <h3>Focus Areas</h3>
        <p>My graduate studies centered on the human dimensions of climate change and environmental governance, with particular emphasis on sustainability transitions, climate policy, circular economy systems, emerging technology governance, and environmental and resource economics.</p>

        <h3>Skills Developed</h3>
        <ul>
          <li>Quantitative social science research methods</li>
          <li>Survey design and behavioral analysis</li>
          <li>Structural equation modeling (SEM)</li>
          <li>Multi-criteria decision analysis (MCDM)</li>
          <li>Policy evaluation and stakeholder analysis</li>
          <li>Statistical analysis using Stata, R, and Python</li>
        </ul>

        <h3>Research Experience</h3>
        <p>Alongside full-time graduate studies, I worked as a researcher at the Global Circular Economy Center, contributing to government-, industry-, and international organization-funded projects on climate policy, circular economy, energy transition, and sustainable industrial development. My responsibilities included project design, stakeholder engagement, data collection, quantitative analysis, report writing, and publication development.</p>
        <p>Through this dual academic-professional role, I gained practical experience supporting Knowledge Sharing Program (KSP) initiatives, corporate sustainability strategy projects, and policy research commissioned by ministries, public institutions, and private-sector organizations.</p>

        <h3>Key Outcomes</h3>
        <p>Produced peer-reviewed publications and policy reports covering environmental governance, sustainable consumption, circular economy, carbon markets, climate-related behavioral change, and international sustainability cooperation. Contributed to multiple national and international projects addressing industrial decarbonization, green transition strategies, and circular economy policy development.</p>
      `,

      'B.A. in International Studies': `
        <h3>Focus Areas</h3>
        <p>My undergraduate studies provided an interdisciplinary foundation in international relations, political science, economics, and global governance. Coursework explored how political institutions, economic systems, and international organizations shape global development, trade, security, and cooperation.</p>

        <h3>Key Areas of Study</h3>
        <ul>
          <li>International relations and diplomatic affairs</li>
          <li>Comparative politics and political economy</li>
          <li>International economics, banking, and capital markets</li>
          <li>International organizations and global governance</li>
          <li>East Asian regional politics and geopolitics</li>
          <li>Energy security and international development</li>
        </ul>

        <h3>Skills Developed</h3>
        <ul>
          <li>Political and economic analysis</li>
          <li>International affairs research</li>
          <li>Policy writing and argumentation</li>
          <li>Critical reading of social science literature</li>
          <li>Quantitative reasoning and introductory econometrics</li>
          <li>Data analysis using Python</li>
        </ul>

        <h3>Academic Perspective</h3>
        <p>Through courses in international relations, comparative politics, political economy, international organizations, and energy geopolitics, I developed a strong theoretical understanding of how states, markets, and non-state actors shape international cooperation and policy outcomes.</p>

      `,

      'Climate Change Negotiation Strategies and Diplomacy, Korea National Diplomatic Academy': `
        <h3>Program Overview</h3>
        <p>Specialized training program focusing on international climate negotiations, diplomatic strategies, and multilateral environmental agreements.</p>
        
        <h3>Key Learning Areas</h3>
        <ul>
          <li>International climate negotiation processes and protocols</li>
          <li>Diplomatic strategies for multilateral environmental agreements</li>
          <li>UNFCCC framework and Paris Agreement implementation</li>
          <li>Stakeholder engagement and consensus building</li>
        </ul>
        
        <h3>Practical Applications</h3>
        <p>This training directly enhanced my ability to contribute to Korea's climate diplomacy efforts and international cooperation initiatives.</p>
      `,
      
      'Statistical Analysis using R, Statistics Training Institute (Statistics Korea)': `
        <h3>Technical Training</h3>
        <p>Comprehensive training in statistical analysis using R programming language, provided by Korea's national statistics agency.</p>
        
        <h3>Skills Developed</h3>
        <ul>
          <li>Advanced statistical modeling and data analysis</li>
          <li>R programming for research and policy analysis</li>
          <li>Data visualization and interpretation</li>
          <li>Quantitative research methodologies</li>
        </ul>
        
        <h3>Research Applications</h3>
        <p>These skills have been instrumental in conducting rigorous quantitative analysis for academic publications and policy research projects.</p>
      `,
      
      'Circular Economy & Sustainability Strategies, University of Cambridge': `
        <h3>Program Overview</h3>
        <p>Professional certificate program from the University of Cambridge focusing on circular economy principles and sustainability strategies for organizations.</p>
        
        <h3>Key Learning Areas</h3>
        <ul>
          <li>Circular economy frameworks and implementation strategies</li>
          <li>Sustainable business model innovation</li>
          <li>Life cycle assessment and environmental impact analysis</li>
          <li>Policy instruments for circular transition</li>
        </ul>
        
        <h3>Practical Applications</h3>
        <p>This training enhanced my understanding of circular economy principles, which has been directly applied in my research on sustainable development and environmental policy analysis.</p>
      `
    };
    
    return certificates[cleanTitle] || `
      <h3>Educational Achievement</h3>
      <p>This qualification represents an important milestone in my academic and professional development.</p>
      
      <h3>Relevance</h3>
      <p>The knowledge and skills gained contribute to my expertise in climate policy, environmental analysis, and sustainable development research.</p>
      
      <p><em>Additional details about this qualification and its specific contributions to my professional capabilities will be added.</em></p>
    `;
  }
  getListContent(cleanTitle) {
    const lists = {
      'Ad hoc Peer Reviewer': `
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px 12px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;">Journal</th>
              <th style="padding:8px 12px;background-color:#5e717d;color:white;text-align:left;font-weight:600;border:1px solid #5e717d;width:28%;">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">Land Use Policy</td>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">Jun. 2026</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">Energy &amp; Environment</td>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">May 2026</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">Carbon Management</td>
              <td style="padding:8px 12px;border:1px solid var(--border);vertical-align:top;">Jul. 2025</td>
            </tr>
          </tbody>
        </table>
      `
    };

    return lists[cleanTitle] || `<p>List details will be added soon.</p>`;
  }
}

// Initialize popup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
