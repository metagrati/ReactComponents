// src/components/Carousel.tsx
import React from 'react';
import { PredictionCard, PredictionCardProps } from '@/components/PredictionCard';

interface CarouselItem extends PredictionCardProps {
  id: string | number;
}

interface CarouselProps {
  items: CarouselItem[];
  itemWidth?: number;
  gap?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  itemWidth = 358, // match PredictionCard's width
  gap = 16,
}) => {
  return (
    <div className="carousel-container overflow-x-aut scroll-smooth py-4">
      <div className="carousel-scroller flex snap-x snap-mandatory" style={{ gap }}>
        {items.map((item) => (
          <div key={item.id} style={{ minWidth: itemWidth }}>
            <PredictionCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
