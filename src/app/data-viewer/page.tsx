
import { getRawDatabaseData } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DataViewerPage() {
    const { users, teams, tasks } = await getRawDatabaseData();

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Trình xem dữ liệu MongoDB</h1>
                    <p className="text-muted-foreground mt-2">
                        Đây là dữ liệu thô từ các collection trong cơ sở dữ liệu của bạn.
                    </p>
                </header>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                        <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>Users Collection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs p-4 bg-background rounded-md overflow-x-auto">
                                    {JSON.stringify(users, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="teams">
                        <Card>
                            <CardHeader>
                                <CardTitle>Teams Collection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs p-4 bg-background rounded-md overflow-x-auto">
                                    {JSON.stringify(teams, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tasks Collection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs p-4 bg-background rounded-md overflow-x-auto">
                                    {JSON.stringify(tasks, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
