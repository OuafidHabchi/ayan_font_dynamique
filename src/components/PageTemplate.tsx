import React from 'react';

interface PageTemplateProps {
  title: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title }) => {
  return (
    <div className="pt-40">
      <h1 className="text-2xl font-bold text-blue-950">Hi this is {title}</h1>
    </div>
  );
};

export default PageTemplate;
