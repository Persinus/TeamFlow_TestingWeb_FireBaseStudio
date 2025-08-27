
"use client"

import React from 'react';
import Image from 'next/image';
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
        image: "https://picsum.photos/800/600?random=1",
        imageHint: "welcome office",
    },
    {
        title: "Bảng điều khiển Kanban",
        description: "Đây là không gian làm việc chính của bạn. Các công việc được tổ chức theo trạng thái: Tồn đọng, Cần làm, Đang làm, và Hoàn thành.",
        image: "https://picsum.photos/800/600?random=2",
        imageHint: "kanban board",
    },
    {
        title: "Tạo công việc mới",
        description: "Nhấn vào nút 'Tạo công việc' ở trên cùng để mở biểu mẫu. Điền thông tin chi tiết, gán cho đội và thành viên, sau đó nhấn 'Tạo'.",
        image: "https://picsum.photos/800/600?random=3",
        imageHint: "new task form",
    },
    {
        title: "Kéo và thả công việc",
        description: "Bạn có thể dễ dàng cập nhật trạng thái của một công việc bằng cách kéo thẻ công việc đó từ cột này và thả vào cột khác.",
        image: "https://picsum.photos/800/600?random=4",
        imageHint: "drag and drop",
    },
    {
        title: "Xem và chỉnh sửa chi tiết",
        description: "Nhấn vào bất kỳ thẻ công việc nào để mở cửa sổ chi tiết. Tại đây bạn có thể xem tất cả thông tin và nhấn vào biểu tượng cây bút để chỉnh sửa.",
        image: "https://picsum.photos/800/600?random=5",
        imageHint: "task details",
    },
    {
        title: "Sử dụng bộ lọc",
        description: "Sử dụng các bộ lọc ở thanh tiêu đề để nhanh chóng tìm kiếm công việc theo đội, người thực hiện, hoặc từ khóa.",
        image: "https://picsum.photos/800/600?random=6",
        imageHint: "filter search",
    },
    {
        title: "Quản lý đội của bạn",
        description: "Trong thanh điều hướng bên trái, bạn có thể xem các đội của mình, hoặc vào phần 'Quản lý đội' để tạo, sửa, xóa đội và thành viên.",
        image: "https://picsum.photos/800/600?random=7",
        imageHint: "team management",
    },
    {
        title: "Bạn đã sẵn sàng!",
        description: "Bây giờ bạn đã nắm được những điều cơ bản. Hãy bắt đầu quản lý dự án của bạn một cách hiệu quả với TeamFlow!",
        image: "https://picsum.photos/800/600?random=8",
        imageHint: "success celebration",
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
        // Reset to first slide for next time
        setTimeout(() => api?.scrollTo(0), 500);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
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
                                    <CardContent className="flex flex-col gap-4 items-center justify-center p-2">
                                        <div className="aspect-video w-full relative overflow-hidden rounded-lg">
                                            <Image 
                                                src={step.image} 
                                                alt={step.title} 
                                                fill 
                                                className="object-cover"
                                                data-ai-hint={step.imageHint}
                                             />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <h3 className="text-lg font-semibold">{step.title}</h3>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                
                <div className="py-2 text-center text-sm text-muted-foreground">
                    Bước {current} trên {count}
                </div>

                <DialogFooter>
                    <Button onClick={handleFinish}>
                        {current === count ? "Hoàn tất" : "Bỏ qua"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
