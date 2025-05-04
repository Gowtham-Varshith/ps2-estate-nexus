
import React from 'react';
import { Check, Ruler } from 'lucide-react';
import { useMetric } from '@/contexts/MetricContext';
import { LandMetric, metricLabels } from '@/utils/metricConversions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const metrics: LandMetric[] = ['sqft', 'acre', 'sqyd', 'ankanam'];

const MetricSelector = () => {
  const { currentMetric, setCurrentMetric } = useMetric();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler size={16} />
          <span>{metricLabels[currentMetric]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {metrics.map((metric) => (
          <DropdownMenuItem
            key={metric}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setCurrentMetric(metric)}
          >
            <span>{metricLabels[metric]}</span>
            {metric === currentMetric && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricSelector;
