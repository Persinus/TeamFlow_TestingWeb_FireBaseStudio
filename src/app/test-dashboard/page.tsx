"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, SkipForward, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';

type TestStatus = 'untested' | 'running' | 'passed' | 'failed' | 'blocked' | 'skipped';

interface TestCase {
  id: string;
  requirement: string;
  expectedResult: string;
  status: TestStatus;
  note?: string;
}

interface TestSuite {
  page: string;
  testCases: TestCase[];
}

const initialTestSuites: TestSuite[] = [
    {
        page: "Quản lý công việc (Cá nhân)",
        testCases: [
            { id: "TC-PV-01", requirement: "Xem chi tiết, chỉnh sửa tiêu đề và trạng thái, và xóa công việc cá nhân.", expectedResult: "Tất cả các bước đều thành công.", status: "untested", note: 'Lỗi xóa công việc cá nhân: Hệ thống đang yêu cầu quyền "Trưởng nhóm" không cần thiết.' },
        ]
    },
    {
        page: "Project Dashboard (Bảng điều khiển dự án)",
        testCases: [
            { id: "TC-DB-01", requirement: "Bảng Kanban phản ánh chính xác trạng thái công việc.", expectedResult: "Công việc nằm đúng cột, thông tin thẻ đúng.", status: "untested" },
            { id: "TC-DB-02", requirement: "Truy cập Dashboard khi chưa xác thực.", expectedResult: "Người dùng được chuyển hướng đến trang đăng nhập.", status: "untested" },
            { id: "TC-DB-03", requirement: "Số lượng công việc trên đầu mỗi cột chính xác.", expectedResult: "Số đếm khớp với số thẻ trong cột.", status: "untested" },
            { id: "TC-DB-04", requirement: "Kéo thả để thay đổi trạng thái và có thông báo toast.", expectedResult: "Công việc di chuyển và toast hiện ra.", status: "untested" },
            { id: "TC-DB-05", requirement: "Lọc và tìm kiếm hoạt động chính xác.", expectedResult: "Danh sách công việc được lọc đúng theo tiêu chí.", status: "untested" },
            { id: "TC-DB-06", requirement: "Xóa bộ lọc và quay về trạng thái ban đầu.", expectedResult: "Tất cả công việc hiển thị lại.", status: "untested" },
            { id: "TC-DB-07", requirement: "Chuyển đổi và xem dữ liệu ở chế độ Lịch và Dòng thời gian.", expectedResult: "Dữ liệu hiển thị đúng trên các chế độ xem.", status: "untested" },
            { id: "TC-DB-08", requirement: "Hiển thị thông báo khi cột không có công việc.", expectedResult: "Hiển thị thông báo thân thiện.", status: "untested" },
        ]
    },
    {
        page: "Reporting & Analysis (Báo cáo & Phân tích)",
        testCases: [
            { id: "TC-AN-01", requirement: "Lọc dữ liệu theo đội và xuất file CSV.", expectedResult: "Dữ liệu lọc đúng và file CSV được tải về chính xác.", status: "untested" },
            { id: "TC-AN-02", requirement: "Vô hiệu hóa nút xuất khi không có dữ liệu.", expectedResult: "Nút xuất CSV bị vô hiệu hóa.", status: "untested" },
            { id: "TC-AN-03", requirement: "Biểu đồ tròn và bảng hiệu suất hiển thị đúng.", expectedResult: "Các biểu đồ và bảng phản ánh đúng dữ liệu.", status: "untested" },
            { id: "TC-AN-04", requirement: "Xử lý lỗi khi tải dữ liệu phân tích.", expectedResult: "Hiển thị thông báo lỗi thay vì màn hình trống.", status: "untested", note: "Trang chỉ hiển thị bộ khung tải trang trống, không có thông báo lỗi." },
        ]
    },
    {
        page: "Team Detail Page (Trang chi tiết đội)",
        testCases: [
            { id: "TC-TD-01", requirement: "Hiển thị chính xác thông tin đội, thành viên và công việc.", expectedResult: "Mọi thông tin đều khớp.", status: "untested" },
            { id: "TC-TD-02", requirement: "Quản lý thành viên (thêm, xóa, đổi vai trò).", expectedResult: "Chức năng hoạt động đúng và tuân thủ quyền hạn.", status: "untested" },
            { id: "TC-TD-03", requirement: "Ngăn chặn việc xóa vai trò Trưởng nhóm cuối cùng.", expectedResult: "Hệ thống báo lỗi và không cho phép.", status: "untested" },
            { id: "TC-TD-04", requirement: "Thông báo toast khi cập nhật trạng thái công việc.", expectedResult: "Toast xác nhận hiện ra sau khi lưu.", status: "untested", note: "Hệ thống có lưu thay đổi nhưng không hiển thị thông báo toast." },
            { id: "TC-TD-05", requirement: "Chức năng tìm kiếm và lọc công việc.", expectedResult: "Có thể tìm và lọc công việc trong đội.", status: "untested", note: "Chức năng này không tồn tại trên trang." },
        ]
    },
    {
        page: "Home Page (Trang chủ)",
        testCases: [
            { id: "TC-HM-01", requirement: "Các thẻ thống kê cá nhân (Tổng, Hoàn thành, Tỷ lệ) hiển thị đúng.", expectedResult: "Số liệu chính xác.", status: "untested" },
            { id: "TC-HM-02", requirement: "Gợi ý của AI và danh sách công việc sắp tới hoạt động đúng.", expectedResult: "Hiển thị gợi ý và danh sách phù hợp.", status: "untested" },
            { id: "TC-HM-03", requirement: "Trang xử lý mượt mà khi không có công việc hoặc lỗi tải dữ liệu.", expectedResult: "Hiển thị trạng thái rỗng hoặc thông báo lỗi phù hợp.", status: "untested" },
        ]
    },
     {
        page: "Tour Guide (Hướng dẫn sử dụng)",
        testCases: [
            { id: "TC-TG-01", requirement: "Mở, điều hướng (tiếp, trước), và đóng modal hướng dẫn.", expectedResult: "Tất cả các tương tác hoạt động như mong đợi.", status: "untested" },
            { id: "TC-TG-02", requirement: "Các nút và bộ đếm bước hoạt động chính xác ở các bước đầu/cuối.", expectedResult: "Nút bị vô hiệu hóa và bộ đếm chính xác.", status: "untested" },
        ]
    }
];

// Dựa trên kết quả kiểm thử trước đó, ta mã hóa cứng kết quả ở đây
const MOCKED_RESULTS: Record<string, 'passed' | 'failed' | 'blocked' | 'skipped'> = {
    "TC-PV-01": "failed",
    "TC-DB-01": "passed", "TC-DB-02": "passed", "TC-DB-03": "passed", "TC-DB-04": "passed", "TC-DB-05": "passed", "TC-DB-06": "passed", "TC-DB-07": "passed", "TC-DB-08": "passed",
    "TC-AN-01": "passed", "TC-AN-02": "passed", "TC-AN-03": "passed", "TC-AN-04": "failed",
    "TC-TD-01": "passed", "TC-TD-02": "passed", "TC-TD-03": "passed", "TC-TD-04": "failed", "TC-TD-05": "blocked",
    "TC-HM-01": "passed", "TC-HM-02": "passed", "TC-HM-03": "passed",
    "TC-TG-01": "passed", "TC-TG-02": "passed"
};


const StatusBadge = ({ status, note }: { status: TestStatus, note?: string }) => {
    switch (status) {
        case 'passed': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Passed</Badge>;
        case 'failed': return <Badge variant="destructive">Failed</Badge>;
        case 'blocked': return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Blocked</Badge>;
        case 'skipped': return <Badge variant="outline">Skipped</Badge>;
        case 'running': return <Badge variant="outline"><Loader2 className="h-4 w-4 animate-spin" /></Badge>;
        default: return <Badge variant="secondary">Chưa chạy</Badge>;
    }
};

const StatusIcon = ({ status }: { status: TestStatus }) => {
    switch (status) {
        case 'passed': return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
        case 'blocked': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        case 'skipped': return <SkipForward className="h-5 w-5 text-muted-foreground" />;
        default: return <div className="h-5 w-5" />;
    }
};

export default function TestDashboardPage() {
    const [suites, setSuites] = useState(initialTestSuites);

    const runTest = useCallback((suiteIndex: number, testCaseIndex: number) => {
        setSuites(prevSuites => {
            const newSuites = [...prevSuites];
            const testCase = newSuites[suiteIndex].testCases[testCaseIndex];
            testCase.status = 'running';
            return newSuites;
        });

        setTimeout(() => {
            setSuites(prevSuites => {
                const newSuites = [...prevSuites];
                const testCase = newSuites[suiteIndex].testCases[testCaseIndex];
                testCase.status = MOCKED_RESULTS[testCase.id] || 'skipped';
                return newSuites;
            });
        }, 700 + Math.random() * 500);
    }, []);
    
    const runAllTests = () => {
        suites.forEach((suite, suiteIndex) => {
            suite.testCases.forEach((_, testCaseIndex) => {
                setTimeout(() => {
                    runTest(suiteIndex, testCaseIndex);
                }, (suiteIndex * 100) + (testCaseIndex * 100)); // Stagger the runs
            });
        });
    };
    
    const resetAll = () => {
         setSuites(initialTestSuites);
    }

    const summary = React.useMemo(() => {
        let passed = 0, failed = 0, blocked = 0, untested = 0, total = 0;
        suites.forEach(suite => {
            suite.testCases.forEach(tc => {
                total++;
                if (tc.status === 'passed') passed++;
                else if (tc.status === 'failed') failed++;
                else if (tc.status === 'blocked') blocked++;
                else if (tc.status === 'untested') untested++;
            });
        });
        const passRate = total > 0 && (passed + blocked) > 0 ? Math.round(((passed + blocked) / (total - untested)) * 100) : 0;
        return { passed, failed, blocked, total, passRate, untested };
    }, [suites]);

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Bảng điều khiển Kiểm thử</h1>
                    <p className="text-muted-foreground mt-2">
                        Mô phỏng quá trình chạy kiểm thử cho các chức năng chính của ứng dụng TeamFlow.
                    </p>
                </header>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Tổng quan kết quả</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{summary.passed}</p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-500">Passed</p>
                        </div>
                        <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{summary.failed}</p>
                            <p className="text-sm font-medium text-red-600 dark:text-red-500">Failed</p>
                        </div>
                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{summary.blocked}</p>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Blocked</p>
                        </div>
                         <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">{summary.passRate}%</p>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Tỷ lệ Pass</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 mb-4">
                    <Button onClick={runAllTests}>Chạy tất cả</Button>
                    <Button variant="outline" onClick={resetAll}>Đặt lại</Button>
                </div>

                <div className="space-y-4">
                    {suites.map((suite, suiteIndex) => (
                        <Card key={suite.page}>
                            <CardHeader>
                                <CardTitle>{suite.page}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {suite.testCases.map((tc, testCaseIndex) => (
                                        <AccordionItem value={tc.id} key={tc.id}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex items-center gap-4 flex-1 text-left">
                                                    <StatusIcon status={tc.status} />
                                                    <span className="font-medium flex-1">{tc.id}: {tc.requirement}</span>
                                                    <StatusBadge status={tc.status} note={tc.note} />
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-10 pr-4">
                                                <div className="text-sm space-y-2">
                                                    <p><strong className="text-muted-foreground">Kỳ vọng:</strong> {tc.expectedResult}</p>
                                                    <AnimatePresence>
                                                    {tc.note && (tc.status === 'failed' || tc.status === 'blocked') && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground"
                                                        >
                                                            <strong className="font-semibold">Ghi chú:</strong> {tc.note}
                                                        </motion.div>
                                                    )}
                                                    </AnimatePresence>
                                                    <Button size="sm" variant="secondary" onClick={() => runTest(suiteIndex, testCaseIndex)} disabled={tc.status === 'running'}>
                                                        {tc.status === 'running' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                        Chạy thử
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
