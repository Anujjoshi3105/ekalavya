
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {cn, getSubjectColor} from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ClockIcon } from "lucide-react";

interface CompanionsListProps {
    title: string;
    companions?: Companion[];
    classNames?: string;
}

const CompanionsList = ({ title, companions, classNames }: CompanionsListProps) => {
    return (
        <article className={cn('companion-list', classNames)}>
            <h2 className="font-bold text-3xl">{title}</h2>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-lg w-2/3">Lessons</TableHead>
                        <TableHead className="text-lg">Subject</TableHead>
                        <TableHead className="text-lg text-right">Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companions?.map(({id, subject, name, topic, duration}, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Link href={`/companion/${id}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="size-[48px] flex items-center justify-center rounded-full max-md:hidden" style={{ backgroundColor: getSubjectColor(subject) }}>
                                            <Image
                                                src={`/icons/${subject}.svg`}
                                                alt={subject}
                                                width={28}
                                                height={28} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-bold text-xl">
                                                {name}
                                            </p>
                                            <p className="text-md truncate">
                                                {topic}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge style={{backgroundColor: getSubjectColor(subject), color: "#000"}} className="w-fit max-md:hidden">
                                    {subject}
                                </Badge>
                                <div className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden" style={{backgroundColor: getSubjectColor(subject)}}>
                                    <Image
                                        src={`/icons/${subject}.svg`}
                                        alt={subject}
                                        width={18}
                                        height={18}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 w-full justify-end">
                                    <p className="text-lg">
                                        {duration} {' '}
                                        <span className="max-md:hidden">mins</span>
                                    </p>
                                    <ClockIcon className="md:hidden size-4" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </article>
    )
}

export default CompanionsList;