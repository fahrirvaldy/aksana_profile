
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PeopleAnalyzerData, ViewType, Employee, Seat } from "../types";

interface PeopleAnalyzerProps {
  onSave?: (data: PeopleAnalyzerData) => void;
  initialData?: PeopleAnalyzerData;
}

export const usePeopleAnalyzer = ({ onSave, initialData }: PeopleAnalyzerProps) => {
  const [view, setView] = useState<ViewType>('setup');
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [seats, setSeats] = useState<Record<string, Seat>>(initialData?.seats || {});
  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || []);

  const prevInitialData = useRef<PeopleAnalyzerData | undefined>(initialData);

  useEffect(() => {
    if (initialData && initialData !== prevInitialData.current) {
        setTimeout(() => {
            setCompanyName(initialData.companyName || "");
            setSeats(initialData.seats || {});
            setEmployees(initialData.employees || []);
            if (initialData.companyName && Object.keys(initialData.seats || {}).length > 0) {
                setView('dashboard');
            }
        }, 0);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const triggerSave = useCallback((updatedData: PeopleAnalyzerData) => {
    if (onSave) {
      onSave(updatedData);
    }
  }, [onSave]);

  const handleSetupComplete = (generatedSeats: Record<string, Seat>, name: string) => {
    setSeats(generatedSeats);
    setCompanyName(name);
    setView('dashboard');
    triggerSave({ companyName: name, seats: generatedSeats, employees });
  };

  const handleAssessmentComplete = (newEmp: Employee) => {
    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    setView('dashboard');
    triggerSave({ companyName, seats, employees: updatedEmployees });
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      triggerSave({ companyName, seats, employees: updatedEmployees });
    }
  };

  const handleReset = () => {
    if (confirm("Perhatian: Memulai ulang profil perusahaan akan menghapus semua data divisi dan karyawan. Lanjutkan?")) {
      setSeats({});
      setEmployees([]);
      setCompanyName("");
      setView('setup');
      triggerSave({ companyName: "", seats: {}, employees: [] });
    }
  };

  return {
    view, setView,
    companyName, setCompanyName,
    seats, setSeats,
    employees, setEmployees,
    handleSetupComplete,
    handleAssessmentComplete,
    handleDeleteEmployee,
    handleReset
  };
};
