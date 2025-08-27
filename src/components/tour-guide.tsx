
"use client"

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from './ui/card';

interface TourGuideProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const tourSteps = [
    {
        title: "Chào mừng đến với TeamFlow!",
        description: "Đây là hướng dẫn nhanh giúp bạn làm quen với các tính năng chính của ứng dụng. Nhấn 'Tiếp theo' để bắt đầu.",
    },
    {
        title: "Bảng điều khiển Kanban",
        description: "Đây là không gian làm việc chính của bạn. Các công việc được tổ chức theo trạng thái: Tồn đọng, Cần làm, Đang làm, và Hoàn thành.",
    },
    {
        title: "Tạo công việc mới",
        description: "Nhấn vào nút 'Tạo công việc' ở trên cùng để mở biểu mẫu. Điền thông tin chi tiết, gán cho đội và thành viên, sau đó nhấn 'Tạo'.",
    },
    {
        title: "Kéo và thả công việc",
        description: "Bạn có thể dễ dàng cập nhật trạng thái của một công việc bằng cách kéo thẻ công việc đó từ cột này và thả vào cột khác.",
    },
    {
        title: "Xem và chỉnh sửa chi tiết",
        description: "Nhấn vào bất kỳ thẻ công việc nào để mở cửa sổ chi tiết. Tại đây bạn có thể xem tất cả thông tin và nhấn vào biểu tượng cây bút để chỉnh sửa.",
    },
    {
        title: "Sử dụng bộ lọc và các chế độ xem",
        description: "Sử dụng các bộ lọc ở thanh tiêu đề để nhanh chóng tìm kiếm công việc. Chuyển đổi giữa các chế độ xem Bảng, Lịch và Dòng thời gian để có những góc nhìn khác nhau về dự án.",
    },
    {
        title: "Quản lý đội của bạn",
        description: "Trong thanh điều hướng bên trái, bạn có thể xem các đội của mình hoặc tạo đội mới để bắt đầu cộng tác.",
    },
    {
        title: "Bạn đã sẵn sàng!",
        description: "Bây giờ bạn đã nắm được những điều cơ bản. Hãy bắt đầu quản lý dự án của bạn một cách hiệu quả với TeamFlow!",
    }
];

export default function TourGuide({ open, onOpenChange }: TourGuideProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const handleFinish = () => {
        onOpenChange(false);
        setTimeout(() => api?.scrollTo(0), 300); // Reset to first slide for next time
    };

    const scrollPrev = React.useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
        api?.scrollNext();
    }, [api]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Hướng dẫn sử dụng TeamFlow</DialogTitle>
                    <DialogDescription>
                       Một chuyến tham quan nhanh các tính năng chính.
                    </DialogDescription>
                </DialogHeader>
                
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {tourSteps.map((step, index) => (
                            <CarouselItem key={index}>
                                <Card className="border-0 shadow-none">
                                    <CardContent className="flex flex-col gap-4 items-center justify-center p-6 text-center h-48">
                                        <h3 className="text-xl font-semibold">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* These buttons can be hidden if we use the footer buttons */}
                    <CarouselPrevious className="invisible" />
                    <CarouselNext className="invisible" />
                </Carousel>
                
                <div className="py-2 text-center text-sm text-muted-foreground">
                    Bước {current} trên {count}
                </div>

                <DialogFooter className="flex-row justify-between w-full">
                    <Button 
                        variant="outline" 
                        onClick={scrollPrev} 
                        disabled={!api?.canScrollPrev()}
                    >
                        Trước
                    </Button>
                    {current === count ? (
                         <Button onClick={handleFinish}>Hoàn tất</Button>
                    ) : (
                        <Button onClick={scrollNext} disabled={!api?.canScrollNext()}>
                            Tiếp theo
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
