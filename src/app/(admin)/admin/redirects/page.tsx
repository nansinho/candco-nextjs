"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Redirect {
  id: string;
  source: string;
  destination: string;
  type: "301" | "302" | "307" | "308";
  hits: number;
  active: boolean;
  createdAt: string;
}

const demoRedirects: Redirect[] = [
  {
    id: "1",
    source: "/formations-sst",
    destination: "/formations/securite/sst",
    type: "301",
    hits: 245,
    active: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    source: "/contact-us",
    destination: "/contact",
    type: "301",
    hits: 180,
    active: true,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    source: "/old-blog/*",
    destination: "/actualites/:splat",
    type: "301",
    hits: 520,
    active: true,
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    source: "/promo-janvier",
    destination: "/formations?promo=janvier2024",
    type: "302",
    hits: 95,
    active: false,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    source: "/inscription",
    destination: "/auth/register",
    type: "301",
    hits: 320,
    active: true,
    createdAt: "2023-12-20",
  },
];

const typeConfig = {
  "301": { label: "301 Permanent", color: "bg-green-500/15 text-green-600" },
  "302": { label: "302 Temporaire", color: "bg-blue-500/15 text-blue-600" },
  "307": { label: "307 Temporaire", color: "bg-amber-500/15 text-amber-600" },
  "308": { label: "308 Permanent", color: "bg-purple-500/15 text-purple-600" },
};

export default function RedirectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newRedirect, setNewRedirect] = useState<{
    source: string;
    destination: string;
    type: "301" | "302" | "307" | "308";
  }>({
    source: "",
    destination: "",
    type: "301",
  });

  const filteredRedirects = demoRedirects.filter(
    (redirect) =>
      redirect.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redirect.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHits = demoRedirects.reduce((sum, r) => sum + r.hits, 0);
  const activeCount = demoRedirects.filter((r) => r.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6" />
            Redirections
          </h1>
          <p className="text-muted-foreground">
            Gérez les redirections d'URL pour le SEO
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total redirections</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoRedirects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total hits</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalHits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Redirect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvelle redirection
          </CardTitle>
          <CardDescription>
            Créez une nouvelle règle de redirection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="URL source (ex: /ancien-chemin)"
                value={newRedirect.source}
                onChange={(e) =>
                  setNewRedirect({ ...newRedirect, source: e.target.value })
                }
              />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground self-center hidden sm:block" />
            <div className="flex-1">
              <Input
                placeholder="URL destination (ex: /nouveau-chemin)"
                value={newRedirect.destination}
                onChange={(e) =>
                  setNewRedirect({ ...newRedirect, destination: e.target.value })
                }
              />
            </div>
            <Select
              value={newRedirect.type}
              onValueChange={(value: "301" | "302" | "307" | "308") =>
                setNewRedirect({ ...newRedirect, type: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 Permanent</SelectItem>
                <SelectItem value="302">302 Temporaire</SelectItem>
                <SelectItem value="307">307 Temporaire</SelectItem>
                <SelectItem value="308">308 Permanent</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Redirects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead></TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hits</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedirects.map((redirect) => {
                const typeInfo = typeConfig[redirect.type];
                return (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {redirect.source}
                      </code>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {redirect.destination}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{redirect.hits}</Badge>
                    </TableCell>
                    <TableCell>
                      {redirect.active ? (
                        <Badge className="bg-green-500/15 text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {redirect.active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRedirects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune redirection trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
