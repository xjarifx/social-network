/**
 * Component Showcase
 * 
 * This file demonstrates all UI components with the theme system.
 * Use this for testing and as a reference for component usage.
 */

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  AvatarFallback,
  Separator,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui";
import { Heart, MessageCircle, Share2, MoreHorizontal, User } from "lucide-react";

export function ComponentShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Component Showcase
          </h1>
          <p className="text-text-secondary">
            All components using semantic theme tokens
          </p>
        </div>

        <Separator />

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Cards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  This is the card content area. You can put any content here.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Card Example</CardTitle>
                <CardDescription>Social media style card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">John Doe</span>
                      <span className="text-text-muted text-sm">@johndoe</span>
                    </div>
                    <p className="text-text-primary mt-2">
                      This is an example post using our component library!
                    </p>
                    <div className="flex gap-4 mt-3">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Inputs</h2>
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Email
              </label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Password
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Message
              </label>
              <Textarea placeholder="Type your message here..." rows={4} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Tabs</h2>
          <Tabs defaultValue="tab1" className="max-w-md">
            <TabsList className="w-full">
              <TabsTrigger value="tab1" className="flex-1">Account</TabsTrigger>
              <TabsTrigger value="tab2" className="flex-1">Password</TabsTrigger>
              <TabsTrigger value="tab3" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-text-secondary">Account settings content</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab2" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-text-secondary">Password settings content</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab3" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-text-secondary">General settings content</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Avatars */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Avatars</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <Separator />

        {/* Dialog */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Dialog</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. It provides context about the dialog content.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-text-secondary">
                  Dialog content goes here. You can put forms, text, or any other content.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <Separator />

        {/* Dropdown Menu */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Dropdown Menu
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Open Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        <Separator />

        {/* Tooltip */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Tooltip</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>

        <Separator />

        {/* Theme Colors Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Theme Colors
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-background border border-border" />
                  <p className="text-sm text-text-secondary">bg-background</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-surface border border-border" />
                  <p className="text-sm text-text-secondary">bg-surface</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-surface-hover border border-border" />
                  <p className="text-sm text-text-secondary">bg-surface-hover</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-accent" />
                  <p className="text-sm text-text-secondary">bg-accent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-danger" />
                  <p className="text-sm text-text-secondary">bg-danger</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-success" />
                  <p className="text-sm text-text-secondary">bg-success</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
