'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function ShadcnDemo() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          shadcn/ui Components Demo
          <Badge variant="secondary">New</Badge>
        </CardTitle>
        <CardDescription>
          A showcase of various shadcn/ui components integrated with your
          project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="demo-input">Demo Input</Label>
          <Input id="demo-input" placeholder="Type something here..." />
        </div>

        <Separator />
        <Switch />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Button Variants</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Button Sizes</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Badge Variants</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
