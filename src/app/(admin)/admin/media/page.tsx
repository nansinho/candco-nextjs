"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Search,
  Upload,
  Grid,
  List,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Trash2,
  Download,
  Copy,
  MoreVertical,
  HardDrive,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  url: string;
  uploadedAt: string;
  dimensions?: string;
}

const demoMedia: MediaFile[] = [
  {
    id: "1",
    name: "hero-banner.jpg",
    type: "image",
    size: 245000,
    url: "/uploads/hero-banner.jpg",
    uploadedAt: "2024-01-20",
    dimensions: "1920x1080",
  },
  {
    id: "2",
    name: "formation-sst.png",
    type: "image",
    size: 180000,
    url: "/uploads/formation-sst.png",
    uploadedAt: "2024-01-18",
    dimensions: "800x600",
  },
  {
    id: "3",
    name: "video-presentation.mp4",
    type: "video",
    size: 15000000,
    url: "/uploads/video-presentation.mp4",
    uploadedAt: "2024-01-15",
  },
  {
    id: "4",
    name: "brochure-2024.pdf",
    type: "document",
    size: 2500000,
    url: "/uploads/brochure-2024.pdf",
    uploadedAt: "2024-01-10",
  },
  {
    id: "5",
    name: "logo-candco.svg",
    type: "image",
    size: 12000,
    url: "/uploads/logo-candco.svg",
    uploadedAt: "2024-01-08",
    dimensions: "200x60",
  },
  {
    id: "6",
    name: "podcast-episode1.mp3",
    type: "audio",
    size: 8500000,
    url: "/uploads/podcast-episode1.mp3",
    uploadedAt: "2024-01-05",
  },
];

const typeConfig = {
  image: { label: "Image", icon: FileImage, color: "bg-blue-500/15 text-blue-600" },
  video: { label: "Vidéo", icon: FileVideo, color: "bg-purple-500/15 text-purple-600" },
  audio: { label: "Audio", icon: FileAudio, color: "bg-green-500/15 text-green-600" },
  document: { label: "Document", icon: File, color: "bg-amber-500/15 text-amber-600" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredMedia = demoMedia.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalSize = demoMedia.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Médiathèque
          </h1>
          <p className="text-muted-foreground">
            Gérez vos images, vidéos et documents
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Importer des fichiers
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total fichiers</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMedia.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <FileImage className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {demoMedia.filter((f) => f.type === "image").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vidéos</CardTitle>
            <FileVideo className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {demoMedia.filter((f) => f.type === "video").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Vidéos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((file) => {
            const typeInfo = typeConfig[file.type];
            const TypeIcon = typeInfo.icon;
            return (
              <Card key={file.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <TypeIcon className="h-12 w-12 text-muted-foreground" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMedia.map((file) => {
                const typeInfo = typeConfig[file.type];
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                      <TypeIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.dimensions && (
                          <>
                            <span>•</span>
                            <span>{file.dimensions}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copier l'URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun fichier trouvé
          </CardContent>
        </Card>
      )}
    </div>
  );
}
