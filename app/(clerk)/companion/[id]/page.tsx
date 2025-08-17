"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import CompanionComponent from "@/components/companion/CompanionComponent";
import { getSubjectColor } from "@/lib/utils";
import { getCompanion } from "@/lib/actions/companion.actions";

const CompanionSession = () => {
  const router = useRouter();
  const params = useParams(); // <-- use useParams hook here
  const { user, isLoaded } = useUser();

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchCompanion = async () => {
      try {
        const id = params.id as string;
        const data = await getCompanion(id);

        if (!data?.name) {
          router.push("/companion");
        } else {
          setCompanion(data);
        }
      } catch (error) {
        console.error(error);
        router.push("/companion");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanion();
  }, [params, user, isLoaded, router]);

  if (loading || !companion) {
    return <p className="p-4 text-lg">Loading companion session...</p>;
  }

  const { name, subject, topic, duration } = companion;

  return (
    <main>
      <article className="flex rounded-border justify-between p-6 max-md:flex-col">
        <div className="flex items-center gap-2">
          <div
            className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={35}
              height={35}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-2xl">{name}</p>
              <Badge className="max-sm:hidden">{subject}</Badge>
            </div>
            <p className="text-lg">{topic}</p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {duration} minutes
        </div>
      </article>

      <CompanionComponent
        {...companion}
        companionId={params.id as string}
        userName={user?.firstName || "User"}
        userImage={user?.imageUrl || ""}
      />
    </main>
  );
};

export default CompanionSession;
