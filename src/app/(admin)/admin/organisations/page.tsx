"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Organisation {
  id: string;
  name: string;
  type: "opco" | "entreprise" | "association" | "collectivite";
  address: string;
  city: string;
  phone: string;
  email: string;
  contactName: string;
  employees: number;
  active: boolean;
  formationsCount: number;
}

const demoOrganisations: Organisation[] = [
  {
    id: "1",
    name: "OPCO Santé",
    type: "opco",
    address: "15 rue de la Santé",
    city: "Paris",
    phone: "01 23 45 67 89",
    email: "contact@opco-sante.fr",
    contactName: "Marie Durand",
    employees: 0,
    active: true,
    formationsCount: 45,
  },
  {
    id: "2",
    name: "Clinique Saint-Jean",
    type: "entreprise",
    address: "100 avenue de la Médecine",
    city: "Marseille",
    phone: "04 91 00 00 00",
    email: "formation@clinique-sj.fr",
    contactName: "Dr. Sophie Martin",
    employees: 250,
    active: true,
    formationsCount: 12,
  },
  {
    id: "3",
    name: "Association Aide à Domicile 13",
    type: "association",
    address: "25 rue du Social",
    city: "Aix-en-Provence",
    phone: "04 42 00 00 00",
    email: "contact@aad13.org",
    contactName: "Jean Petit",
    employees: 80,
    active: true,
    formationsCount: 8,
  },
  {
    id: "4",
    name: "Mairie de Marseille",
    type: "collectivite",
    address: "Place Bargemon",
    city: "Marseille",
    phone: "04 91 55 11 11",
    email: "formation@marseille.fr",
    contactName: "Pierre Blanc",
    employees: 12000,
    active: false,
    formationsCount: 3,
  },
];

const typeConfig = {
  opco: { label: "OPCO", color: "bg-purple-500/15 text-purple-600" },
  entreprise: { label: "Entreprise", color: "bg-blue-500/15 text-blue-600" },
  association: { label: "Association", color: "bg-green-500/15 text-green-600" },
  collectivite: { label: "Collectivité", color: "bg-amber-500/15 text-amber-600" },
};

export default function OrganisationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = demoOrganisations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Organismes
          </h1>
          <p className="text-muted-foreground">
            Gérez les organismes partenaires, OPCO et clients
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel organisme
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total organismes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoOrganisations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OPCO</CardTitle>
            <Badge className={typeConfig.opco.color}>OPCO</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoOrganisations.filter((o) => o.type === "opco").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demoOrganisations.filter((o) => o.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoOrganisations.reduce((sum, o) => sum + o.formationsCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un organisme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisme</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Formations</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => {
                const type = typeConfig[org.type];
                return (
                  <TableRow key={org.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{org.name}</div>
                      {org.employees > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {org.employees} employés
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={type.color}>{type.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{org.contactName}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {org.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {org.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {org.city}
                      </div>
                      <div className="text-xs text-muted-foreground">{org.address}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.formationsCount} formations</Badge>
                    </TableCell>
                    <TableCell>
                      {org.active ? (
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
                  </TableRow>
                );
              })}
              {filteredOrgs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun organisme trouvé
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
