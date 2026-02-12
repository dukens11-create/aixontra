# UI Component Library

A comprehensive shadcn/ui-inspired component library built with React, TypeScript, Tailwind CSS, and Radix UI primitives.

## Overview

This component library provides 19 professionally designed, accessible, and fully typed React components that follow modern best practices and integrate seamlessly with the design system defined in `src/app/globals.css`.

## Features

- ✅ **TypeScript**: Full type safety with comprehensive TypeScript definitions
- ✅ **Accessible**: Built on Radix UI primitives with proper ARIA attributes
- ✅ **Customizable**: Uses Tailwind CSS and class-variance-authority (cva) for flexible styling
- ✅ **Modern React**: Uses forwardRef, proper event handling, and React best practices
- ✅ **Design System**: Fully integrated with the design tokens from globals.css
- ✅ **Tree-shakeable**: Import only the components you need

## Installation

All required dependencies are already installed:

```json
{
  "@radix-ui/react-*": "Latest versions",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.1",
  "react-hot-toast": "^2.4.1"
}
```

## Usage

Import components from `@/components/ui`:

```tsx
import { Button, Card, Input } from "@/components/ui";

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Components

### Base Input Components

#### Button
Button component with multiple variants and sizes.

**Variants**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`  
**Sizes**: `sm`, `md`, `lg`, `icon`

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="md">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small</Button>
```

#### Input
Text input field with error state support.

```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="Email" />
<Input error placeholder="Invalid input" />
```

#### Label
Form label component.

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email Address</Label>
```

#### Textarea
Multi-line text input.

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter your message" />
```

#### Select
Dropdown select using Radix UI.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox
Checkbox component using Radix UI.

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>
```

### Layout Components

#### Card
Card container with header, title, description, content, and footer sections.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog
Modal dialog using Radix UI.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

#### Dropdown Menu
Dropdown menu using Radix UI.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Tabs
Tab navigation using Radix UI.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Popover
Popover component using Radix UI.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content</p>
  </PopoverContent>
</Popover>
```

### Feedback Components

#### Toast
Toast notifications using react-hot-toast.

```tsx
import { toast, Toaster } from "@/components/ui/toast";

// Add Toaster to your app root
<Toaster />

// Show toasts
toast("Simple message");
toast({ title: "Success", description: "Operation completed" });
toast.success("Success message", "Optional description");
toast.error("Error message", "Optional description");
```

#### Spinner
Loading spinner with multiple sizes.

**Sizes**: `sm`, `md`, `lg`, `xl`

```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner size="md" />
```

#### Skeleton
Loading skeleton placeholder.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32" />
```

#### Progress
Progress bar using Radix UI.

```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={60} />
```

### Data Display Components

#### Avatar
User avatar using Radix UI.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Badge
Status badge with variants.

**Variants**: `default`, `secondary`, `destructive`, `outline`

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Slider
Range slider using Radix UI.

```tsx
import { Slider } from "@/components/ui/slider";

<Slider defaultValue={[50]} max={100} step={1} />
```

### Other Components

#### Separator
Visual divider/separator.

```tsx
import { Separator } from "@/components/ui/separator";

<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

## Design Tokens

Components use CSS custom properties defined in `src/app/globals.css`:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

## Utilities

### cn() - Class Name Utility

The `cn()` utility from `@/lib/utils` merges Tailwind CSS classes intelligently:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class", className)} />
```

## Component Patterns

### forwardRef

All components use `React.forwardRef` to allow ref forwarding:

```tsx
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("base-classes", className)} {...props} />
  )
);
```

### Variants with CVA

Components use `class-variance-authority` for type-safe variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const variants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-classes",
      secondary: "secondary-classes",
    },
    size: {
      sm: "sm-classes",
      lg: "lg-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});
```

## Demo

See `src/components/ui/demo.tsx` for a comprehensive showcase of all components.

## TypeScript Support

All components are fully typed with TypeScript:

- Props interfaces extend native HTML element props
- Variants are type-safe with `VariantProps`
- Refs are properly typed
- Full IntelliSense support

## Accessibility

Components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Semantic HTML

## Contributing

When adding new components:

1. Use `React.forwardRef` for ref forwarding
2. Extend appropriate HTML element props
3. Use `cn()` utility for class merging
4. Add TypeScript types
5. Include proper ARIA attributes
6. Add to `index.ts` for exports
7. Document usage examples

## License

This component library is part of the Aixontra project.
