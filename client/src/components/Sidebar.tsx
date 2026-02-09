import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export interface TrendingItem {
  id: string;
  category: string;
  title: string;
  count: number;
  trend?: "up" | "down";
}

export interface SidebarProps {
  trends?: TrendingItem[];
  showSearch?: boolean;
}

export function Sidebar({ trends = [], showSearch = true }: SidebarProps) {
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.05,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Search */}
      {showSearch && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input type="text" placeholder="Search..." className="pl-10" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* What's happening */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <CardTitle className="text-base sm:text-lg">
              What's happening
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <motion.div className="divide-y divide-border/60">
            {trends.length > 0 ? (
              trends.map((item, idx) => (
                <motion.button
                  key={item.id}
                  custom={idx}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full p-4 text-left transition hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.count.toLocaleString()} posts
                      </p>
                    </div>
                    {item.trend === "up" && (
                      <div className="text-xs font-semibold text-accent">+</div>
                    )}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No trends available
                </p>
              </div>
            )}
          </motion.div>
          {trends.length > 0 && (
            <div className="p-4">
              <Separator className="mb-4" />
              <Button variant="ghost" className="w-full">
                View More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer note */}
      <div className="text-center text-xs text-muted-foreground">
        <p>© 2026 Social. All rights reserved.</p>
      </div>
    </motion.div>
  );
}
