'use client';

import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  homeHref?: string;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, items, homeHref = '/dashboard', ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(
          'flex items-center space-x-1 text-sm text-muted-foreground',
          className
        )}
        {...props}
      >
        <a
          href={homeHref}
          className="flex items-center hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Главная</span>
        </a>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4" />
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export { Breadcrumbs };
export type { BreadcrumbItem };
