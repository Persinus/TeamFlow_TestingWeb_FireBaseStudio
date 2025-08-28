
import { getRawDatabaseData } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function DataViewerPage() {
    const { users, teams, tasks } = await getRawDatabaseData();

    const renderAccordion = (items: any[], titleKey: string, idKey: string = '_id') => (
        <Card>
            <CardContent className="p-0">
                 <ScrollArea className="h-[60vh]">
                    <Accordion type="single" collapsible className="w-full p-4">
                        {items.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={item[idKey]}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="text-left">
                                    <p className="font-semibold">{item[titleKey] || `Bản ghi ${index + 1}`}</p>
                                    <p className="text-sm text-muted-foreground">ID: {item[idKey]}</p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <pre className="text-xs p-4 bg-muted/50 rounded-md overflow-x-auto">
                                    {JSON.stringify(item, null, 2)}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                 </ScrollArea>
            </CardContent>
        </Card>
    );

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Trình xem dữ liệu MongoDB</h1>
                    <p className="text-muted-foreground mt-2">
                        Dữ liệu thô từ các collection. Nhấp vào một mục để xem chi tiết.
                    </p>
                </header>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                        <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        {renderAccordion(users, 'hoTen')}
                    </TabsContent>
                    <TabsContent value="teams">
                        {renderAccordion(teams, 'tenNhom')}
                    </TabsContent>
                    <TabsContent value="tasks">
                        {renderAccordion(tasks, 'tieuDe')}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
