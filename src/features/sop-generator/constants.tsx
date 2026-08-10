
import { Truck, BadgeDollarSign, Users2, Building2 } from "lucide-react";
import { FormField, Schemas } from "./types";

export const getDivisions = (t: (key: string) => string) => [
  { id: 'ops', name: t('divisions.ops.name'), icon: <Truck size={24} />, description: t('divisions.ops.description') },
  { id: 'fin', name: t('divisions.fin.name'), icon: <BadgeDollarSign size={24} />, description: t('divisions.fin.description') },
  { id: 'mkt', name: t('divisions.mkt.name'), icon: <Users2 size={24} />, description: t('divisions.mkt.description') },
  { id: 'hrd', name: t('divisions.hrd.name'), icon: <Building2 size={24} />, description: t('divisions.hrd.description') },
];

export const getFormSchemas = (t: any): Schemas => {
  const rawSchemas = t('schemas') as Schemas;
  return {
    ops: rawSchemas.ops.map((f: FormField, i: number) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
    fin: rawSchemas.fin.map((f: FormField, i: number) => ({ ...f, type: i === 3 ? 'textarea' : 'text' })),
    mkt: rawSchemas.mkt.map((f: FormField, i: number) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
    hrd: rawSchemas.hrd.map((f: FormField, i: number) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
  };
};
