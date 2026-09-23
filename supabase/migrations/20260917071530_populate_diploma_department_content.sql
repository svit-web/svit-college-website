update departments set
  about = 'The Computer Engineering (Diploma) department provides industry-ready technical education in computer hardware, software, and networking. With modern computer labs and experienced faculty, we prepare students for careers in IT and software industries.',
  vision = 'To be a leading diploma program producing skilled computer engineering technicians who meet industry standards and contribute to technological advancement.',
  mission = 'To provide quality technical education in computer engineering through practical training, industry collaboration, and continuous curriculum updates aligned with technological trends.',
  intake_ug = 60,
  overview = 'The diploma program offers comprehensive training in programming, databases, networking, and web technologies with strong emphasis on practical skills and industry readiness.',
  metadata = metadata - 'about' - 'vision' - 'mission' - 'intake'
where slug = 'com-dip';

update departments set
  about = 'The Information Technology (Diploma) department focuses on software development, web technologies, and IT infrastructure. Our curriculum is designed to create job-ready IT professionals with strong practical skills.',
  vision = 'To develop competent IT professionals who can adapt to evolving technologies and contribute effectively to the software and IT service industries.',
  mission = 'To deliver quality IT education through hands-on training, industry exposure, and modern teaching methods that prepare students for successful IT careers.',
  intake_ug = 60,
  overview = 'The program emphasizes software development, web technologies, and IT infrastructure management with regular industry interactions and project-based learning.'
where slug = 'it-dip';

update departments set
  about = 'The Electrical Engineering (Diploma) department trains students in electrical systems, power distribution, and industrial automation. Our well-equipped electrical labs provide hands-on experience in electrical installations and maintenance.',
  vision = 'To create skilled electrical engineering technicians capable of working in the power sector, industries, and electrical services with safety and efficiency.',
  mission = 'To provide quality technical education in electrical engineering through practical training, safety awareness, and exposure to modern electrical systems and renewable energy.',
  intake_ug = 60,
  overview = 'Students learn electrical machines, power systems, industrial automation, and renewable energy with extensive practical training in electrical workshops.'
where slug = 'elect-dip';

update departments set
  about = 'The Mechanical Engineering (Diploma) department offers comprehensive training in manufacturing, design, and thermal systems. Our workshops are equipped with modern machines and tools for practical training.',
  vision = 'To develop skilled mechanical engineering technicians who excel in manufacturing, maintenance, and production environments.',
  mission = 'To provide industry-oriented mechanical engineering education through hands-on workshop training, modern CAD/CAM tools, and strong industry linkages.',
  intake_ug = 60,
  overview = 'The program covers machine design, manufacturing processes, CAD/CAM, and thermal engineering with extensive workshop practice and industrial training.'
where slug = 'mech-dip';

update departments set
  about = 'The Civil Engineering (Diploma) department trains students in construction technology, surveying, and building design. Field visits and practical training on construction sites are integral parts of the curriculum.',
  vision = 'To produce competent civil engineering technicians who can contribute to infrastructure development and the construction industry.',
  mission = 'To deliver quality civil engineering education through practical training, site exposure, and modern surveying and design tools.',
  intake_ug = 60,
  overview = 'Students gain knowledge in building construction, surveying, structural basics, and construction management with regular site visits and practical training.'
where slug = 'civil-dip';

update departments set
  about = 'The Applied Science & Humanities department provides foundational education in Mathematics, Physics, Chemistry, English, and Communication Skills to all diploma students. We focus on building strong conceptual understanding and communication abilities.',
  vision = 'To develop strong foundational knowledge and communication skills in diploma students, enabling them to excel in their technical education and professional careers.',
  mission = 'To provide quality education in basic sciences, mathematics, and humanities that supports technical learning and develops well-rounded engineering professionals.',
  overview = 'The department teaches core subjects including Mathematics, Physics, Chemistry, English, Environmental Science, and Soft Skills to first- and second-year diploma students across all branches.'
where slug = 'ash-dip';
