
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: "Modern Living Room",
      category: "living",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Contemporary design with warm neutral tones"
    },
    {
      id: 2,
      title: "Elegant Bedroom Suite",
      category: "bedroom",
      image: "https://images.unsplash.com/photo-1631889993959-41b4e9c19697?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Luxurious comfort meets sophisticated style"
    },
    {
      id: 3,
      title: "Gourmet Kitchen",
      category: "kitchen",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Functional beauty for culinary enthusiasts"
    },
    {
      id: 4,
      title: "Home Office Sanctuary",
      category: "office",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Productive workspace with inspiring design"
    },
    {
      id: 5,
      title: "Cozy Reading Nook",
      category: "living",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Perfect retreat for quiet moments"
    },
    {
      id: 6,
      title: "Spa-Like Bathroom",
      category: "bathroom",
      image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Serene sanctuary for daily rituals"
    }
  ];

  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'living', label: 'Living Spaces' },
    { key: 'bedroom', label: 'Bedrooms' },
    { key: 'kitchen', label: 'Kitchens' },
    { key: 'bathroom', label: 'Bathrooms' },
    { key: 'office', label: 'Offices' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Our Portfolio
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8">
            Explore our recent projects and see how we transform spaces into beautiful, 
            functional environments that exceed expectations.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-none animate-fade-in"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-stone-200">{project.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
