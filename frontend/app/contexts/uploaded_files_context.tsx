"use client"

import { apiService } from "@/lib/api-service";
import { UploadedFileSummary } from "@/types";
import { usePrivy } from "@privy-io/react-auth";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type AppState = {
  uploadedFiles: UploadedFileSummary[] | null;
  setUploadedFiles: (files: UploadedFileSummary[]) => void;
  points: number | null;
  setPoints: (points: number) => void;
};

export const UploadedFilesContext = createContext<AppState | undefined>(
  undefined
);

export const useUploadedFiles = () => {
  const context = useContext(UploadedFilesContext);
  if (!context) {
    throw new Error(
      "useUploadedFiles must be used within a UploadedFilesProvider"
    );
  }
  return context;
};

export const PeriodicallyUpdatedUploadedFiles = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {authenticated} = usePrivy();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileSummary[]|null>(null);
  const [points, setPoints] = useState<number|null>(null);

  const updatePoints = () => {
    apiService.getPoints().then((res) => {
      if (res.success) {
        if (res.data?.points) {
          setPoints(res.data?.points);
        } else {
          setPoints(0);
        }
      }
    })
  };

  const updateUploadedFiles = () => {
    apiService.getConversations().then((res) => {
      if (res.success) {
        setUploadedFiles(res.data!.map((file) => ({
          id: file.id,
          fileName: file.file_name,
          status: file.status,
        })));
      }
    });
  };

  useEffect(() => {
    // periodically update uploaded files
    const interval = setInterval(() => {
      console.log("updating uploaded files")
      if (authenticated) {
        updateUploadedFiles();
        updatePoints();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      updateUploadedFiles();
      updatePoints();
    }
  }, [authenticated])

  return (
    <UploadedFilesContext.Provider value={{ uploadedFiles, setUploadedFiles, points, setPoints }}>
      {children}
    </UploadedFilesContext.Provider>
  );
};
