import React from 'react';
import './Carousel.css'; // We'll define some CSS in a separate file (or use Tailwind classes directly)

interface CarouselItem {
  id: string | number;
  title: string;
  image: string;
  // ...add any other fields you want
}

interface CarouselProps {
  items: CarouselItem[];
  itemSize?: number; // The width/height of the round card
  gap?: number; // Gap between cards
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  itemSize = 150,
  gap = 16,
}) => {
  return (
    <div className="carousel-container">
      <div className="carousel-scroller" style={{ gap: `${gap}px` }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-item"
            style={{ width: itemSize, height: itemSize }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="carousel-item-image"
            />
            <div className="carousel-item-title">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
