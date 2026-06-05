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
            
            this.showPopup(title, content);
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
      default:
        console.warn('Unknown popup type:', popupType);
    }
  }

  showPopup(title, content) {
    const titleElement = this.overlay.querySelector('.popup-title');
    const bodyElement = this.overlay.querySelector('.popup-body');
    
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
    // Clean title by removing dash and date information for matching
    const cleanTitle = title.replace(/^-\s*/, '').split(' | ')[0].trim();
    
    const experiences = {
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
      
      'Researcher, Climate & Energy Cooperation Center, Ministry of Foreign Affairs': `
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
      
      'Research Associate, Global Circular Economy Center, Hanyang University': `
        <h3>Role Overview</h3>
        <p>Conducted interdisciplinary research on circular economy principles and their applications in various industries and policy contexts.</p>
        
        <h3>Research Focus</h3>
        <ul>
          <li>Circular economy implementation in manufacturing and logistics</li>
          <li>Environmental policy analysis and behavioral economics</li>
          <li>Sustainable business model development</li>
          <li>Multi-criteria decision-making analysis for sustainability</li>
        </ul>
        
        <h3>Academic Contributions</h3>
        <p>Published multiple peer-reviewed articles on circular economy, environmental behavior, and sustainable development, contributing to both academic knowledge and practical policy applications.</p>
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
      'M.A. in Environmental Policy, Hanyang University': `
        <h3>Program Overview</h3>
        <p>Master's degree in Environmental Policy from Hanyang University, focusing on climate governance, environmental economics, and policy analysis.</p>
        
        <h3>Academic Excellence</h3>
        <p><strong>GPA:</strong> 3.86/4.00 (97.9/100)</p>
        <p>Achieved academic distinction through rigorous coursework and research in environmental policy and governance.</p>
        
        <h3>Key Areas of Study</h3>
        <ul>
          <li>Climate policy and international negotiations</li>
          <li>Environmental economics and behavioral analysis</li>
          <li>Sustainable development and circular economy</li>
          <li>Policy evaluation and multi-criteria decision making</li>
        </ul>
        
        <h3>Research Focus</h3>
        <p>Thesis research concentrated on climate governance mechanisms and their implementation challenges, contributing to current debates on international cooperation for climate action.</p>
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
}

// Initialize popup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
