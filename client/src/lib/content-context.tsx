import { createContext, useContext, useState, useEffect } from "react";

interface Profile {
  name: string;
  jobTitle: string;
  bio: string;
  email: string;
  twitter: string;
  github: string;
  linkedin: string;
}

interface ContentContextType {
  profile: Profile;
  updateProfile: (newProfile: Partial<Profile>) => void;
}

const defaultProfile: Profile = {
  name: "Arshad Teli",
  jobTitle: "Product Manager",
  bio: "Hey there! I’m a Product Manager & Designer currently working at a UK based fintech!",
  email: "art9793@gmail.com",
  twitter: "https://x.com/art9793",
  github: "https://github.com/art9793",
  linkedin: "",
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("site-profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem("site-profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (newProfile: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <ContentContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
