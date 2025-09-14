export const questions = {
  initial: [
    {
      id: 'main_goals',
      label: 'What are your main goals for joining the server? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Become the best version of myself',
          value: 'best_version',
          corresponding_role: 'Self Improvement',
        },
        {
          label: 'Improve my physical health and wellness',
          value: 'physical_health',
          corresponding_role: 'Physical Fitness',
        },
        {
          label: 'Improve my mental well-being',
          value: 'mental_wellbeing',
          corresponding_role: 'Mental Health',
        },
        {
          label: 'Building or growing a business',
          value: 'business_owner',
          corresponding_role: 'Business Owner',
        },
        {
          label: 'Mentoring or helping others',
          value: 'mentoring_others',
          corresponding_role: 'Mentor',
        },
        {
          label: 'Networking with other professionals',
          value: 'networking',
          corresponding_role: 'Networker',
        },
        {
          label: 'Getting advice on a current project',
          value: 'getting_advice',
          corresponding_role: 'Advice Seeker',
        },
        {
          label: 'Get involved with programming',
          value: 'programming',
          corresponding_role: 'Programmer',
        },
        {
          label: 'Get involved with product development',
          value: 'product_development',
          corresponding_role: 'Product Developer',
        },
        {
          label: 'Learning new skills',
          value: 'learning_new_skills',
          corresponding_role: 'Learner',
        },
        {
          label: 'Finding a job',
          value: 'finding_a_job',
          corresponding_role: 'Job Seeker',
        },
      ],
    },
    {
      id: 'industry',
      label: 'What industry are you currently in or looking to join?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Tech/Software/IT',
          value: 'tech_software_it',
          corresponding_role: 'Tech Professional',
        },
        {
          label: 'Healthcare',
          value: 'healthcare',
          corresponding_role: 'Healthcare Professional',
        },
        {
          label: 'Finance',
          value: 'finance',
          corresponding_role: 'Finance Professional',
        },
        {
          label: 'Education',
          value: 'education',
          corresponding_role: 'Education Professional',
        },
        {
          label: 'Creative/Design',
          value: 'creative_design',
          corresponding_role: 'Creative Professional',
        },
        {
          label: 'Business',
          value: 'business',
          corresponding_role: 'Business Professional',
        },
        {
          label: 'Government',
          value: 'government',
          corresponding_role: 'Government Professional',
        },
        {
          label: 'Non-Profit',
          value: 'non_profit',
          corresponding_role: 'Non-Profit Professional',
        },
        {
          label: 'Skilled Trades',
          value: 'skilled_trades',
          corresponding_role: 'Skilled Trades Professional',
        },
        {
          label: 'Legal',
          value: 'legal',
          corresponding_role: 'Legal Professional',
        },
        {
          label: 'Hospitality',
          value: 'hospitality',
          corresponding_role: 'Hospitality Professional',
        },
        {
          label: 'Retail',
          value: 'retail',
          corresponding_role: 'Retail Professional',
        },
        {
          label: 'Manufacturing',
          value: 'manufacturing',
          corresponding_role: 'Manufacturing Professional',
        },
        {
          label: 'Transportation',
          value: 'transportation',
          corresponding_role: 'Transportation Professional',
        },
        {
          label: 'Agriculture',
          value: 'agriculture',
          corresponding_role: 'Agriculture Professional',
        },
        {
          label: 'Construction',
          value: 'construction',
          corresponding_role: 'Construction Professional',
        },
        {
          label: 'Real Estate',
          value: 'real_estate',
          corresponding_role: 'Real Estate Professional',
        },
        {
          label: 'Media',
          value: 'media',
          corresponding_role: 'Media Professional',
        },
        {
          label: 'Sports',
          value: 'sports',
          corresponding_role: 'Sports Professional',
        },
        {
          label: 'Entertainment',
          value: 'entertainment',
          corresponding_role: 'Entertainment Professional',
        },
        {
          label: 'Other:',
          value: 'other_industry',
          textInput: true,
        },
      ],
    },
    {
      id: 'current_role',
      label: 'What do you currently do for work?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Software Engineer / Developer',
          value: 'software_engineer',
          corresponding_role: 'Software Engineer',
        },
        {
          label: 'Designer / UI/UX',
          value: 'designer_ui_ux',
          corresponding_role: 'Designer',
        },
        {
          label: 'Product Manager',
          value: 'product_manager',
          corresponding_role: 'Product Manager',
        },
        {
          label: 'Business Professional',
          value: 'business_professional',
          corresponding_role: 'Business Professional',
        },
        {
          label: 'Entrepreneur / Business Owner',
          value: 'entrepreneur',
          corresponding_role: 'Entrepreneur',
        },
        {
          label: 'Investor',
          value: 'investor',
          corresponding_role: 'Investor',
        },
        {
          label: 'Mentor',
          value: 'mentor',
          corresponding_role: 'Mentor',
        },
        {
          label: 'Industry Expert',
          value: 'industry_expert',
          corresponding_role: 'Industry Expert',
        },
        {
          label: 'Student',
          value: 'student',
          corresponding_role: 'Student',
        },
        {
          label: 'Recruiter / HR',
          value: 'recruiter',
          corresponding_role: 'Recruiter',
        },
        {
          label: 'Marketing Professional',
          value: 'marketing_professional',
          corresponding_role: 'Marketing Professional',
        },
        {
          label: 'Data Scientist / Analyst',
          value: 'data_scientist_analyst',
          corresponding_role: 'Data Scientist',
        },
        {
          label: 'Project Manager',
          value: 'project_manager',
          corresponding_role: 'Project Manager',
        },
        {
          label: 'Business Analyst',
          value: 'business_analyst',
          corresponding_role: 'Business Analyst',
        },
        {
          label: 'Business Strategist',
          value: 'business_strategist',
          corresponding_role: 'Business Strategist',
        },
        {
          label: 'Sales Professional',
          value: 'sales_professional',
          corresponding_role: 'Sales Professional',
        },
        {
          label: 'Content Creator',
          value: 'content_creator',
          corresponding_role: 'Content Creator',
        },
        {
          label: 'Community Manager',
          value: 'community_manager',
          corresponding_role: 'Community Manager',
        },
        {
          label: 'Freelancer',
          value: 'freelancer',
          corresponding_role: 'Freelancer',
        },
        {
          label: 'Consultant',
          value: 'consultant',
          corresponding_role: 'Consultant',
        },
        {
          label: 'Senior-level Professional / Executive',
          value: 'senior_executive',
          corresponding_role: 'Executive',
        },
        {
          label: 'Other:',
          value: 'other_current_role',
          textInput: true,
        },
      ],
    },
  ],
  'job-seeker': [
    {
      id: 'job_situation',
      label: 'Which of these describes your current career or business situation?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: "I'm actively looking for a new role.",
          value: 'actively_looking',
          corresponding_role: 'Job Seeker',
        },
        {
          label: "I'm a student or just finished school.",
          value: 'student',
          corresponding_role: 'Student',
        },
        {
          label: "I'm employed but want to grow professionally.",
          value: 'employed_growing',
          corresponding_role: 'Professional',
        },
        {
          label: "I'm an entrepreneur running my own business.",
          value: 'entrepreneur',
          corresponding_role: 'Entrepreneur',
        },
        {
          label: 'Other:',
          value: 'other_job_situation',
          textInput: true,
        },
      ],
    },
    {
      id: 'job_goal',
      label: 'What is your specific job search goal?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Landing my first job',
          value: 'first_job',
        },
        {
          label: 'Transitioning to a new role/company',
          value: 'transitioning',
        },
        {
          label: 'Finding freelance or contract work',
          value: 'freelance',
        },
        {
          label: 'Relocating to a new city or country',
          value: 'relocating',
        },
        {
          label: 'Other:',
          value: 'other_job_goal',
          textInput: true,
        },
      ],
    },
    {
      id: 'industry_field',
      label: 'What industry or career field are you currently in or interested in pursuing?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Software/IT/Tech',
          value: 'software_tech',
          corresponding_role: 'Tech Professional',
        },
        {
          label: 'Sales',
          value: 'sales',
          corresponding_role: 'Sales Professional',
        },
        {
          label: 'Marketing/Advertising',
          value: 'marketing_advertising',
          corresponding_role: 'Marketing Professional',
        },
        {
          label: 'Trades/Skilled Labor',
          value: 'trades_labor',
          corresponding_role: 'Trades Professional',
        },
        {
          label: 'Finance/Accounting',
          value: 'finance',
          corresponding_role: 'Finance Professional',
        },
        {
          label: 'Healthcare/Medical',
          value: 'healthcare',
          corresponding_role: 'Healthcare Professional',
        },
        {
          label: 'Creative Arts/Design',
          value: 'creative_arts',
          corresponding_role: 'Creative Professional',
        },
        {
          label: 'Education',
          value: 'education',
          corresponding_role: 'Education Professional',
        },
        {
          label: 'Wellness Coach',
          value: 'wellness_coach',
          corresponding_role: 'Wellness Professional',
        },
        {
          label: 'Legal/Law',
          value: 'legal_law',
          corresponding_role: 'Legal Professional',
        },
        {
          label: 'Other:',
          value: 'other_industry',
          textInput: true,
        },
      ],
    },
    {
      id: 'resume_portfolio',
      label: 'How would you describe your current resume/portfolio?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: "It's complete and ready to go.",
          value: 'resume_complete',
        },
        {
          label: "It's a work in progress and needs improvement.",
          value: 'resume_in_progress',
        },
        {
          label: "I haven't started building one yet.",
          value: 'resume_not_started',
        },
        {
          label: "I'm not sure what to include.",
          value: 'resume_unsure',
        },
      ],
    },
  ],
  'new-skills': [
    {
      id: 'new_skills_type',
      label: 'What type of new skills are you most interested in learning?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Programming and software development',
          value: 'programming',
        },
        {
          label: 'Business and entrepreneurship',
          value: 'business',
        },
        {
          label: 'Communication Skills',
          value: 'communication',
          corresponding_role: 'Communication Skills',
        },
        {
          label: 'Content Creation',
          value: 'content_creation',
          corresponding_role: 'Content Creation',
        },
        {
          label: 'Writing',
          value: 'writing',
          corresponding_role: 'Writing',
        },
        {
          label: 'Health, nutrition, and fitness',
          value: 'health_nutrition',
          corresponding_role: 'Health and Fitness',
        },
        {
          label: 'Leadership',
          value: 'leadership',
          corresponding_role: 'Leadership',
        },
        {
          label: 'Personal Development',
          value: 'personal_development',
          corresponding_role: 'Personal Development',
        },
        {
          label: 'Personal finance and investing',
          value: 'personal_finance',
          corresponding_role: 'Personal Finance',
        },
        {
          label: 'Problem Solving',
          value: 'problem_solving',
          corresponding_role: 'Problem Solving',
        },
        {
          label: 'Public Speaking',
          value: 'public_speaking',
          corresponding_role: 'Public Speaking',
        },
        {
          label: 'Team Building',
          value: 'team_building',
          corresponding_role: 'Team Building',
        },
        {
          label: 'Time Management',
          value: 'time_management',
          corresponding_role: 'Time Management',
        },
        {
          label: 'Other:',
          value: 'other_new_skills',
          textInput: true,
        },
      ],
    },
  ],
  'product-development': [
    {
      id: 'product_development_role',
      label: 'What is your primary role or interest in product development?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Product Manager',
          value: 'product_manager',
          corresponding_role: 'Product Manager',
        },
        {
          label: 'Product Owner',
          value: 'product_owner',
          corresponding_role: 'Product Owner',
        },
        {
          label: 'Software Architect',
          value: 'software_architect',
          corresponding_role: 'Software Architect',
        },
        {
          label: 'Software Engineer',
          value: 'software_engineer',
          corresponding_role: 'Software Engineer',
        },
        {
          label: 'UX/UI Designer',
          value: 'ux_ui_designer',
          corresponding_role: 'UX/UI Designer',
        },
        {
          label: 'Quality Assurance (QA) Engineer',
          value: 'qa_engineer',
          corresponding_role: 'QA Engineer',
        },
        {
          label: 'Business Analyst',
          value: 'business_analyst',
          corresponding_role: 'Business Analyst',
        },
        {
          label: 'Other:',
          value: 'other_role',
          textInput: true,
        },
      ],
    },
    {
      id: 'product_development_phase',
      label: 'What phase(s) of the product development life cycle are you most interested in or currently focused on?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Ideation and Discovery',
          value: 'ideation_discovery',
        },
        {
          label: 'Planning and Strategy',
          value: 'planning_strategy',
        },
        {
          label: 'Development and Execution',
          value: 'development_execution',
        },
        {
          label: 'Testing and Quality Assurance',
          value: 'testing_qa',
        },
        {
          label: 'Launch and Post-Launch Analysis',
          value: 'launch_analysis',
        },
        {
          label: 'Other:',
          value: 'other_phase',
          textInput: true,
        },
      ],
    },
  ],
  'programming': [
    {
      id: 'programming_experience',
      label: "What's your current experience level with programming?",
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Just getting started (less than 1 year)',
          value: 'less_than_1_year',
          corresponding_role: 'Beginner Programmer',
        },
        {
          label: 'Early career (1-3 years experience)',
          value: '1_3_years',
          corresponding_role: 'Junior Programmer',
        },
        {
          label: 'Mid-level (3-7 years experience)',
          value: '3_7_years',
          corresponding_role: 'Mid-level Programmer',
        },
        {
          label: 'Senior/Established (7-15 years experience)',
          value: '7_15_years',
          corresponding_role: 'Senior Programmer',
        },
        {
          label: 'Master (15+ years experience)',
          value: '15_plus_years',
          corresponding_role: 'Master Programmer',
        },
        {
          label: 'Other:',
          value: 'other_experience',
          textInput: true,
        },
      ],
    },
    {
      id: 'languages',
      label: 'What programming languages do you use or want to learn? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'HTML',
          value: 'html',
          corresponding_role: 'HTML',
        },
        {
          label: 'CSS',
          value: 'css',
          corresponding_role: 'CSS',
        },
        {
          label: 'JavaScript',
          value: 'javascript',
          corresponding_role: 'JavaScript',
        },
        {
          label: 'Java',
          value: 'java',
          corresponding_role: 'Java',
        },
        {
          label: 'PHP',
          value: 'php',
          corresponding_role: 'PHP',
        },
        {
          label: 'Python',
          value: 'python',
          corresponding_role: 'Python',
        },
        {
          label: 'C++',
          value: 'cplusplus',
          corresponding_role: 'C++',
        },
        {
          label: 'C#',
          value: 'csharp',
          corresponding_role: 'C#',
        },
        {
          label: 'Go',
          value: 'go',
          corresponding_role: 'Go',
        },
        {
          label: 'Kotlin',
          value: 'kotlin',
          corresponding_role: 'Kotlin',
        },
        {
          label: 'Rust',
          value: 'rust',
          corresponding_role: 'Rust',
        },
        {
          label: 'Ruby',
          value: 'ruby',
          corresponding_role: 'Ruby',
        },
        {
          label: 'Swift',
          value: 'swift',
          corresponding_role: 'Swift',
        },
        {
          label: 'TypeScript',
          value: 'typescript',
          corresponding_role: 'TypeScript',
        },
        {
          label: 'Other:',
          value: 'other_language',
          textInput: true,
        },
      ],
    },
    {
      id: 'fullstack_stacks',
      label: 'What full-stack or monolithic stacks do you currently use? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'MERN Stack (MongoDB, Express, React, Node.js)',
          value: 'mern_stack',
          corresponding_role: 'MERN',
        },
        {
          label: 'MEAN Stack (MongoDB, Express, Angular, Node.js)',
          value: 'mean_stack',
          corresponding_role: 'MEAN',
        },
        {
          label: 'MEVN Stack (MongoDB, Express, Vue, Node.js)',
          value: 'mevn_stack',
          corresponding_role: 'MEVN',
        },
        {
          label: 'LAMP Stack (Linux, Apache, MySQL, PHP)',
          value: 'lamp_stack',
          corresponding_role: 'LAMP',
        },
        {
          label: 'JAMstack (JavaScript, APIs, Markup)',
          value: 'jamstack',
          corresponding_role: 'JAMstack',
        },
        {
          label: 'Other:',
          value: 'other_fullstack',
          textInput: true,
        },
      ],
    },
    {
      id: 'frontend_tech',
      label: 'What frontend technologies do you currently use? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'React',
          value: 'react',
          corresponding_role: 'React',
        },
        {
          label: 'Next.js',
          value: 'nextjs',
          corresponding_role: 'Next.js',
        },
        {
          label: 'Vue.js',
          value: 'vuejs',
          corresponding_role: 'Vue.js',
        },
        {
          label: 'Nuxt.js',
          value: 'nuxtjs',
          corresponding_role: 'Nuxt.js',
        },
        {
          label: 'Angular',
          value: 'angular',
          corresponding_role: 'Angular',
        },
        {
          label: 'Svelte',
          value: 'svelte',
          corresponding_role: 'Svelte',
        },
        {
          label: 'Tailwind CSS',
          value: 'tailwind_css',
          corresponding_role: 'Tailwind CSS',
        },
        {
          label: 'Other:',
          value: 'other_frontend',
          textInput: true,
        },
      ],
    },
    {
      id: 'backend_tech',
      label: 'What backend technologies do you currently use? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Node.js',
          value: 'nodejs',
          corresponding_role: 'Node.js',
        },
        {
          label: 'Express.js',
          value: 'expressjs',
          corresponding_role: 'Express.js',
        },
        {
          label: 'Django/Flask (Python)',
          value: 'django_flask',
          corresponding_role: 'Python Backend',
        },
        {
          label: 'Ruby on Rails',
          value: 'ruby_on_rails',
          corresponding_role: 'Rails',
        },
        {
          label: '.NET (C#, ASP.NET)',
          value: 'dotnet',
          corresponding_role: '.NET',
        },
        {
          label: 'Spring (Java)',
          value: 'spring',
          corresponding_role: 'Spring',
        },
        {
          label: 'Laravel (PHP)',
          value: 'laravel',
          corresponding_role: 'Laravel',
        },
        {
          label: 'Other:',
          value: 'other_backend',
          textInput: true,
        },
      ],
    },
    {
      id: 'database_tech',
      label: 'What database technologies do you currently use? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'MongoDB',
          value: 'mongodb',
          corresponding_role: 'MongoDB',
        },
        {
          label: 'MySQL/PostgreSQL',
          value: 'mysql_postgresql',
          corresponding_role: 'SQL',
        },
        {
          label: 'Firebase/Firestore',
          value: 'firebase',
          corresponding_role: 'Firebase',
        },
        {
          label: 'Other:',
          value: 'other_database',
          textInput: true,
        },
      ],
    },
    {
      id: 'cloud_devops_tech',
      label: 'What cloud or DevOps technologies do you currently use? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'AWS',
          value: 'aws',
          corresponding_role: 'AWS',
        },
        {
          label: 'Google Cloud',
          value: 'google_cloud',
          corresponding_role: 'Google Cloud',
        },
        {
          label: 'Azure',
          value: 'azure',
          corresponding_role: 'Azure',
        },
        {
          label: 'Docker/Kubernetes',
          value: 'docker_kubernetes',
          corresponding_role: 'DevOps',
        },
        {
          label: 'Other:',
          value: 'other_cloud',
          textInput: true,
        },
      ],
    },
  ],
  'project-advice': [
    {
      id: 'project_subject',
      label: 'What is the main subject of your project?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'Web Development (Front-end)',
          value: 'web_frontend',
          corresponding_role: 'Frontend Developer',
        },
        {
          label: 'Web Development (Back-end)',
          value: 'web_backend',
          corresponding_role: 'Backend Developer',
        },
        {
          label: 'Data Science / Machine Learning',
          value: 'data_science',
          corresponding_role: 'Data Scientist',
        },
        {
          label: 'Mobile App Development',
          value: 'mobile_app_dev',
          corresponding_role: 'Mobile Developer',
        },
        {
          label: 'Game Development',
          value: 'game_dev',
          corresponding_role: 'Game Developer',
        },
        {
          label: 'Other:',
          value: 'other_project_subject',
          textInput: true,
        },
      ],
    },
    {
      id: 'help_needed',
      label: 'Where are you currently stuck or what kind of help do you need?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'General advice and guidance',
          value: 'general_guidance',
        },
        {
          label: 'Code review and best practices',
          value: 'code_review',
        },
        {
          label: 'Debugging a specific error',
          value: 'debugging_error',
        },
        {
          label: 'Choosing the right technology or tools',
          value: 'tech_tools_choice',
        },
        {
          label: 'Project management and planning',
          value: 'project_planning',
        },
        {
          label: 'Other:',
          value: 'other_help_needed',
          textInput: true,
        },
      ],
    },
  ],
  networking: [
    {
      id: 'networking_goal',
      label: 'What is your primary goal for networking?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Expanding my professional network in my current field.',
          value: 'expand_current_field',
        },
        {
          label: 'Connecting with people in a new or different industry.',
          value: 'connect_new_industry',
        },
        {
          label: 'Finding a mentor or an accountability partner.',
          value: 'find_mentor',
        },
        {
          label: 'Seeking advice for career growth or professional development.',
          value: 'seek_career_advice',
        },
        {
          label: 'Other:',
          value: 'other_networking_goal',
          textInput: true,
        },
      ],
    },
    {
      id: 'roles_to_connect',
      label: 'What specific roles or types of people are you looking to connect with?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Software Engineers / Developers',
          value: 'software_engineers',
        },
        {
          label: 'Designers / UI/UX',
          value: 'designers_ui_ux',
        },
        {
          label: 'Product Managers',
          value: 'product_managers',
        },
        {
          label: 'Business Professionals',
          value: 'business_professionals',
        },
        {
          label: 'Entrepreneurs / Business Owners',
          value: 'entrepreneurs',
        },
        {
          label: 'Investors',
          value: 'investors',
        },
        {
          label: 'Mentors',
          value: 'mentors',
        },
        {
          label: 'Industry Experts',
          value: 'industry_experts',
        },
        {
          label: 'Fellow Students',
          value: 'fellow_students',
        },
        {
          label: 'Recruiters / HR',
          value: 'recruiters',
        },
        {
          label: 'Marketing Professionals',
          value: 'marketing_professionals',
        },
        {
          label: 'Data Scientists / Analysts',
          value: 'data_scientists_analysts',
        },
        {
          label: 'Project Managers',
          value: 'project_managers',
        },
        {
          label: 'Business Analysts',
          value: 'business_analysts',
        },
        {
          label: 'Business Strategists',
          value: 'business_strategists',
        },
        {
          label: 'Sales Professionals',
          value: 'sales_professionals',
        },
        {
          label: 'Content Creators',
          value: 'content_creators',
        },
        {
          label: 'Community Managers',
          value: 'community_managers',
        },
        {
          label: 'Freelancers',
          value: 'freelancers',
        },
        {
          label: 'Consultants',
          value: 'consultants',
        },
        {
          label: 'Senior-level professionals / Executives',
          value: 'senior_executives',
        },
        {
          label: 'Other:',
          value: 'other_roles',
          textInput: true,
        },
      ],
    },
  ],
  mentoring: [
    {
      id: 'mentoring_motivation',
      label: 'What are your primary motivations for mentoring or helping others?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Giving back to the community',
          value: 'give_back',
        },
        {
          label: 'Building my leadership and communication skills',
          value: 'build_skills',
          corresponding_role: 'Communication Skills',
        },
        {
          label: 'Expanding my professional network',
          value: 'expand_network',
        },
        {
          label: 'Staying current on new technologies and best practices',
          value: 'stay_current',
        },
        {
          label: 'Other:',
          value: 'other_mentoring_motivation',
          textInput: true,
        },
      ],
    },
    {
      id: 'expertise_areas',
      label: 'What areas of expertise are you most confident in sharing?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Programming / Coding',
          value: 'programming_coding',
        },
        {
          label: 'Career Development',
          value: 'career_development',
        },
        {
          label: 'Business Strategy',
          value: 'business_strategy',
        },
        {
          label: 'Product Development',
          value: 'product_development',
        },
        {
          label: 'Design / UI/UX',
          value: 'design_ui_ux',
        },
        {
          label: 'Marketing',
          value: 'marketing',
        },
        {
          label: 'Sales',
          value: 'sales',
        },
        {
          label: 'Data Science / Analytics',
          value: 'data_science_analytics',
        },
        {
          label: 'Project Management',
          value: 'project_management',
        },
        {
          label: 'Leadership',
          value: 'leadership',
        },
        {
          label: 'Personal Development',
          value: 'personal_development',
        },
        {
          label: 'Financial Planning',
          value: 'financial_planning',
        },
        {
          label: 'Health & Wellness',
          value: 'health_wellness',
        },
        {
          label: 'Communication Skills',
          value: 'communication_skills',
        },
        {
          label: 'Time Management',
          value: 'time_management',
        },
        {
          label: 'Problem Solving',
          value: 'problem_solving',
        },
        {
          label: 'Team Building',
          value: 'team_building',
        },
        {
          label: 'Public Speaking',
          value: 'public_speaking',
        },
        {
          label: 'Writing / Content Creation',
          value: 'writing_content_creation',
        },
        {
          label: 'Networking',
          value: 'networking_expertise',
        },
        {
          label: 'Other:',
          value: 'other_expertise_area',
          textInput: true,
        },
      ],
    },
    {
      id: 'preferred_help',
      label: 'What is your preferred way to help?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Providing one-on-one guidance',
          value: 'one_on_one',
        },
        {
          label: 'Participating in group discussions',
          value: 'group_discussions',
        },
        {
          label: 'Reviewing code or projects',
          value: 'code_review',
        },
        {
          label: 'Giving presentations or workshops',
          value: 'workshops',
        },
        {
          label: 'Other:',
          value: 'other_help_way',
          textInput: true,
        },
      ],
    },
  ],
  'business-owner': [
    {
      id: 'business_stage',
      label: 'What stage is your business currently in?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: "Just an idea; I'm in the planning phase.",
          value: 'planning_phase',
        },
        {
          label: 'I have a side project or "solopreneur" business.',
          value: 'solopreneur',
        },
        {
          label: 'I have an established business with employees.',
          value: 'established_business',
        },
        {
          label: 'I am looking for co-founders or partners.',
          value: 'seeking_partners',
        },
      ],
    },
    {
      id: 'business_focus',
      label: 'What is your focus for business growth right now?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Marketing and client acquisition',
          value: 'marketing_acquisition',
        },
        {
          label: 'Scaling and hiring',
          value: 'scaling_hiring',
        },
        {
          label: 'Financial management and funding',
          value: 'financial_management',
        },
        {
          label: 'Improving operational efficiency',
          value: 'operational_efficiency',
        },
      ],
    },
  ],
  'mental-health': [
    {
      id: 'mental_wellbeing_rating',
      label: 'On a scale of 1-5, how would you describe your current mental well-being?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: '1 - Struggling',
          value: 'struggling',
        },
        {
          label: '2 - Coping',
          value: 'coping',
        },
        {
          label: '3 - Surviving',
          value: 'surviving',
        },
        {
          label: '4 - Growing',
          value: 'growing',
        },
        {
          label: '5 - Thriving',
          value: 'thriving',
        },
      ],
    },
    {
      id: 'mental_health_support',
      label: 'What are you currently doing to support your mental health? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Journaling',
          value: 'journaling',
        },
        {
          label: 'Walking or exercising',
          value: 'exercising',
        },
        {
          label: 'Meditating',
          value: 'meditating',
        },
        {
          label: 'Working with a counselor or therapist',
          value: 'counselor',
        },
        {
          label: 'Practicing breathwork',
          value: 'breathwork',
        },
        {
          label: 'Talking with friends or family',
          value: 'talking_friends',
        },
        {
          label: 'Reading books or listening to podcasts on the subject',
          value: 'reading_podcasts',
        },
        {
          label: 'Engaging in creative hobbies (e.g., painting, playing music)',
          value: 'creative_hobbies',
        },
        {
          label: 'Other:',
          value: 'other_mental_support',
          textInput: true,
        },
      ],
    },
    {
      id: 'sense_of_purpose',
      label: 'How would you rate your sense of purpose or spiritual fulfillment?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'I feel connected and purposeful.',
          value: 'connected_purposeful',
        },
        {
          label: "I'm exploring and seeking a deeper connection.",
          value: 'exploring_seeking',
        },
        {
          label: "I'm not focused on this aspect of my life.",
          value: 'not_focused',
        },
        {
          label: 'Other:',
          value: 'other_purpose',
          textInput: true,
        },
      ],
    },
    {
      id: 'biggest_challenge_mental',
      label: 'What are your biggest challenges in improving your mental well-being?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Finding the time',
          value: 'lack_of_time',
        },
        {
          label: 'Lack of motivation',
          value: 'lack_of_motivation',
        },
        {
          label: 'Not knowing where to start',
          value: 'not_knowing_where_to_start',
        },
        {
          label: 'Financial constraints',
          value: 'financial_constraints',
        },
        {
          label: 'Lack of a supportive community',
          value: 'lack_of_community',
        },
        {
          label: 'Other:',
          value: 'other_challenge_mental',
          textInput: true,
        },
      ],
    },
    {
      id: 'mental_health_resources',
      label: 'What type of resources or support would be most helpful to you?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Guided meditations and breathwork sessions',
          value: 'guided_meditations',
        },
        {
          label: 'Discussions on productivity and overcoming procrastination',
          value: 'productivity_discussions',
        },
        {
          label: 'Peer support groups',
          value: 'peer_support',
        },
        {
          label: 'Access to recommended books and articles',
          value: 'books_articles',
        },
        {
          label: 'Other:',
          value: 'other_mental_resources',
          textInput: true,
        },
      ],
    },
  ],
  'physical-health': [
    {
      id: 'physical_health_statement',
      label: 'When it comes to your physical health and fitness, which statement resonates with you most?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: "I'm actively working on improving my physical health.",
          value: 'actively_improving',
        },
        {
          label: 'I have a good routine and feel physically strong.',
          value: 'good_routine',
        },
        {
          label: "I'm looking for a way to get started.",
          value: 'get_started',
        },
        {
          label: "I haven't been focused on this",
          value: 'not_focused_physical',
        },
        {
          label: 'Other:',
          value: 'other_physical_statement',
          textInput: true,
        },
      ],
    },
    {
      id: 'physical_health_goals',
      label: 'What are your primary goals for improving your physical health? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Weight management or body composition',
          value: 'weight_management',
        },
        {
          label: 'Increasing muscle strength and endurance',
          value: 'muscle_strength',
        },
        {
          label: 'Improving cardiovascular health',
          value: 'cardiovascular_health',
        },
        {
          label: 'Increasing flexibility or mobility',
          value: 'flexibility',
        },
        {
          label: 'Improving posture',
          value: 'posture_improvement',
        },
        {
          label: 'Managing a specific health condition',
          value: 'manage_condition',
        },
        {
          label: 'Other:',
          value: 'other_physical_goals',
          textInput: true,
        },
      ],
    },
    {
      id: 'current_physical_activities',
      label: 'What are you currently doing for your physical health and wellness? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Attending fitness classes',
          value: 'gym_classes',
        },
        {
          label: 'Walking or running',
          value: 'walking_running',
        },
        {
          label: 'Following a specific diet or meal plan',
          value: 'diet_meal_plan',
        },
        {
          label: 'Doing at-home workouts',
          value: 'at_home_workouts',
        },
        {
          label: 'Playing sports',
          value: 'playing_sports',
        },
        {
          label: 'General Fitness',
          value: 'general_fitness',
          corresponding_role: 'Fitness',
        },
        {
          label: 'Gym Workouts',
          value: 'gym_workouts',
          corresponding_role: 'Gym Goer',
        },
        {
          label: 'Running',
          value: 'running',
          corresponding_role: 'Runner',
        },
        {
          label: 'Yoga',
          value: 'yoga',
          corresponding_role: 'Yoga',
        },
        {
          label: 'Outdoor Activities',
          value: 'outdoor_activities',
          corresponding_role: 'Outdoor Enthusiast',
        },
        {
          label: 'Sports',
          value: 'sports',
          corresponding_role: 'Sports Player',
        },
        {
          label: 'Dancing',
          value: 'dancing',
          corresponding_role: 'Dancer',
        },
        {
          label: 'Martial Arts',
          value: 'martial_arts',
          corresponding_role: 'Martial Artist',
        },
        {
          label: 'Cycling',
          value: 'cycling',
          corresponding_role: 'Cyclist',
        },
        {
          label: 'Swimming',
          value: 'swimming',
          corresponding_role: 'Swimmer',
        },
        {
          label: 'Hiking',
          value: 'hiking',
          corresponding_role: 'Hiker',
        },
        {
          label: 'Weightlifting',
          value: 'weightlifting',
          corresponding_role: 'Weightlifter',
        },
        {
          label: 'CrossFit',
          value: 'crossfit',
          corresponding_role: 'CrossFit',
        },
        {
          label: 'Pilates',
          value: 'pilates',
          corresponding_role: 'Pilates',
        },
        {
          label: 'Other:',
          value: 'other_specific_activities',
          textInput: true,
        },
      ],
    },
    {
      id: 'food_nutrition_relationship',
      label: 'What is your current relationship with food and nutrition?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'I feel good about my eating habits and have a balanced diet.',
          value: 'balanced_diet',
        },
        {
          label: "I'm trying to make healthier choices and learn more about nutrition.",
          value: 'healthier_choices',
        },
        {
          label: "I'm struggling to find a healthy routine.",
          value: 'struggling_routine',
        },
        {
          label: 'I am not focused on this area right now.',
          value: 'not_focused_nutrition',
        },
        {
          label: 'Other:',
          value: 'other_nutrition_relationship',
          textInput: true,
        },
      ],
    },
    {
      id: 'physical_health_support',
      label: 'What kind of support would be most helpful to you?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Workout plans or routines',
          value: 'workout_plans',
        },
        {
          label: 'Nutrition advice or meal ideas',
          value: 'nutrition_advice',
        },
        {
          label: 'Accountability from peers',
          value: 'accountability',
        },
        {
          label: 'Injury prevention and recovery tips',
          value: 'injury_prevention',
        },
        {
          label: 'Other:',
          value: 'other_physical_support',
          textInput: true,
        },
      ],
    },
  ],
  'best-version': [
    {
      id: 'best_version_description',
      label: 'What does the "best version of yourself" look like in your life? (Select all that apply)',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Professionally successful and impactful',
          value: 'professionally_successful',
        },
        {
          label: 'Healthy and physically vibrant',
          value: 'healthy_vibrant',
        },
        {
          label: 'Mentally and emotionally resilient',
          value: 'mentally_resilient',
        },
        {
          label: 'Financially free and secure',
          value: 'financially_free',
        },
        {
          label: 'Other:',
          value: 'other_best_version',
          textInput: true,
        },
      ],
    },
    {
      id: 'one_major_goal',
      label: 'What is one major goal you want to achieve within the next 12 months?',
      questionType: 'singleSelectButton',
      options: [
        {
          label: 'A career change or promotion',
          value: 'career_change',
        },
        {
          label: 'Starting or scaling a business',
          value: 'start_side_business',
        },
        {
          label: 'Completing a challenging personal project (e.g., running a marathon)',
          value: 'personal_project',
        },
        {
          label: 'Mastering a new skill or hobby',
          value: 'master_new_skill',
        },
        {
          label: 'Other:',
          value: 'other_major_goal',
          textInput: true,
        },
      ],
    },
    {
      id: 'biggest_obstacle',
      label: 'What do you believe is currently holding you back?',
      questionType: 'multiSelectButton',
      options: [
        {
          label: 'Lack of motivation or discipline',
          value: 'lack_of_motivation',
        },
        {
          label: 'Fear of failure or uncertainty',
          value: 'fear_of_failure',
        },
        {
          label: 'Fear of success',
          value: 'fear_of_success',
        },
        {
          label: 'Financial limitations',
          value: 'financial_limitations',
        },
        {
          label: 'Not knowing where to start',
          value: 'not_knowing_where_to_start',
        },
        {
          label: 'Other:',
          value: 'other_obstacle',
          textInput: true,
        },
      ],
    },
  ],
};

export const categoryOrder = [
  {
    triggerValue: 'finding_a_job',
    category: 'job-seeker',
  },
  {
    triggerValue: 'learning_new_skills',
    category: 'new-skills',
  },
  {
    triggerValue: 'product_development',
    category: 'product-development',
  },
  {
    triggerValue: 'programming',
    category: 'programming',
  },
  {
    triggerValue: 'getting_advice',
    category: 'project-advice',
  },
  {
    triggerValue: 'networking',
    category: 'networking',
  },
  {
    triggerValue: 'mentoring_others',
    category: 'mentoring',
  },
  {
    triggerValue: 'business_owner',
    category: 'business-owner',
  },
  {
    triggerValue: 'mental_wellbeing',
    category: 'mental-health',
  },
  {
    triggerValue: 'physical_health',
    category: 'physical-health',
  },
  {
    triggerValue: 'best_version',
    category: 'best-version',
  },
];
