import React, { forwardRef } from "react";
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet.jsx"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Badge } from "@/components/ui/badge"

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

import { logout } from "@/redux/authSlice";


import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const NavBar = () => {
    const [open, setOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);


    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };



    const components = [
        {
            title: "Alert Dialog",
            href: "/docs/primitives/alert-dialog",
            description:
                "A modal dialog that interrupts the user with important content and expects a response.",
        },
        {
            title: "Hover Card",
            href: "/docs/primitives/hover-card",
            description:
                "For sighted users to preview content available behind a link.",
        },
        {
            title: "Progress",
            href: "/docs/primitives/progress",
            description:
                "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
        },
        {
            title: "Scroll-area",
            href: "/docs/primitives/scroll-area",
            description: "Visually or semantically separates content.",
        }

    ]


    return (
        <div className="w-full bg-[#63144c]">
            <div className='lg:max-w-[1400px] m-auto flex justify-between gap-2 p-2   h-[4rem] '>
                <div className="flex justify-center items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem >
                                <NavigationMenuTrigger className=" text-[white] px-4 py-2 rounded-md transition [&>svg]:text-white">
                                    <span className="text-white text-[15px]">Getting Started</span>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-[#63144c]  text-white p-4 ">
                                    <ul className="grid gap-3 p-4 w-[250px] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <a className="flex h-full w-full select-none flex-col justify-end hover:bg-[#37102d] border-4 border-[white] p-6 no-underline outline-none focus:shadow-md transition" href="/">
                                                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                                                        AI Campus Portal
                                                    </div>
                                                    <p className="text-sm leading-tight text-gray-300">
                                                        Smart AI-driven platform for students, faculty, and administrators.
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/" title="Student Portal" className="text-gray-200 hover:text-white hover:bg-[#37102d]">
                                            Access your courses, assignments, AI-powered study tools, and more.
                                        </ListItem>
                                        <ListItem href="/" title="Faculty Portal" className="text-gray-200 hover:text-white hover:bg-[#37102d]">
                                            Manage courses, student progress, and AI-generated analytics.
                                        </ListItem>
                                        <ListItem href="/" title="Admin Panel" className="text-gray-200 hover:text-white hover:bg-[#37102d]">
                                            Oversee campus activities, AI automation, and institution-wide analytics.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="hidden sm:block ">
                                <NavigationMenuTrigger className=" text-[white] px-4 py-2 rounded-md transition [&>svg]:text-white">
                                    <span className="text-white text-[15px] ">Components</span>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-[#63144c] text-white p-4 shadow-5xl">
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                        {components.map((component) => (
                                            <ListItem
                                                className="hover:bg-[#37102d]"
                                                key={component.title}
                                                title={component.title}
                                            >
                                                {component.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {
                                user &&
                                <NavigationMenuItem className="hidden sm:flex justify-center items-center">
                                    <Link
                                        className="text-white mr-3 hover:underline"
                                        to={"/admin-dashboard"}
                                    >
                                        Dashboard
                                    </Link>
                                </NavigationMenuItem>
                            }

                            {
                                !user &&
                                <NavigationMenuItem className="hidden sm:flex justify-center items-center">
                                    <Link
                                        className="text-white mr-3 hover:underline"
                                        href={"#dashboard"}
                                        onClick={(e) => {
                                            document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });

                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                </NavigationMenuItem>
                            }



                            {
                                user && !user.email.includes("admin") &&
                                <NavigationMenuItem className=" hidden sm:flex justify-center items-center">
                                    <Link className="text-white mr-5 hover:underline" href="/">
                                        Grades
                                    </Link>
                                </NavigationMenuItem>
                            }
                            { user && !user.email.includes("admin") &&
                                <NavigationMenuItem className=" hidden sm:flex justify-center items-center">
                                    <Link className="text-white mr-5 hover:underline" href="/">
                                        Attendance
                                    </Link>
                                </NavigationMenuItem>
                            }


                        </NavigationMenuList>
                    </NavigationMenu>

                </div>

                {user && (
                    <Sheet onOpenChange={setIsOpen}>
                        <SheetTrigger>
                            <div className="sm:hidden">
                                <div
                                    className="flex flex-col justify-between w-6 h-4 group bg-[000957]"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <span className={`h-[2px] w-full bg-[white] dark:bg-white rounded transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2.5" : ""}`}></span>
                                    <span className={`h-[2px] w-full bg-[white] dark:bg-white rounded transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></span>
                                    <span className={`h-[2px] w-full bg-[white] dark:bg-white rounded transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`}></span>
                                </div>
                            </div>
                        </SheetTrigger>
                        <SheetContent className="sm:hidden bg-[#63144c] text-white w-64 h-full p-4">
                            <SheetHeader>
                                <SheetTitle className="text-lg font-bold">CampusCHAT</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 flex justify-between gap-5 bg-[#1A1A1D] p-2 border-2 rounded-xl" >
                                <div className="flex flex-col justify-start items-center gap-2">
                                    <div >
                                        <Avatar className="w-14 h-15 ">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>Profile</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <Badge className="bg-[#63144c]">{user.email.includes("admin") ? "Admin" : "Student"}</Badge>
                                    </div>
                                    <div>
                                        <Badge className="bg-[#63144c]">{user.email.includes("admin") ? user.institutionDomain : user.studentId}</Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="bg-[#63144c] p-1 rounded-[10px] text-center">{user.firstName + " " + user.lastName}</span>

                                    <span className="bg-[#63144c] text-sm text-center p-1 rounded-[10px]">
                                        {
                                            (user.email.includes("admin")) ?
                                        (user.institutionName.length > 15) ? user.institutionName.substring(0, 12) + "..." : user.institutionName : 
                                        (user.departmentId.length > 15) ? user.departmentId.substring(0, 12) + "..." : user.departmentId
                                        }
                                    </span>
                                </div>
                            </div>
                            <nav className="   bg-[#63144c] w-full m-auto rounded-b-2xl pt-6 text-center pb-6">
                                <ul className="space-y-4">
                                    {
                                        user.email.includes("admin") &&
                                        <Link to={"/admin-dashboard"}>
                                            <li className="bg-[#1A1A1D] shadow-5xl w-[90%] m-auto  hover:bg-[#1e0b18] p-3 rounded-[2rem] cursor-pointer">Dashboard</li>
                                        </Link>
                                    }
                                    {
                                        !user.email.includes("admin") &&
                                        <li className="bg-[#1A1A1D] w-[90%] m-auto  hover:bg-[#1e0b18] p-3 rounded-[2rem] cursor-pointer">Grades</li>
                                    }
                                    {
                                        !user.email.includes("admin") &&
                                        <li className="bg-[#1A1A1D] w-[90%] m-auto  hover:bg-[#1e0b18] p-3 rounded-[2rem] cursor-pointer">Attendance</li>
                                    }

                                    <li className="bg-[#1A1A1D] w-[90%] m-auto  hover:bg-[#1e0b18] p-3 rounded-[2rem] cursor-pointer">Profile</li>
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <li className="bg-red-700 w-[90%] m-auto hover:bg-red-900 p-3 rounded-[2rem] cursor-pointer">Logout</li>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white">
                                            <DialogHeader>
                                                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                                                <DialogDescription>
                                                    You will be logged out and redirected to the home page.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                                <Button className="bg-red-600 text-white hover:bg-red-800" onClick={handleLogout}>Logout</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                </ul>
                            </nav>
                        </SheetContent>
                    </Sheet>
                )}
                {
                    user && <HoverCard>
                        <HoverCardTrigger className="cursor-pointer hidden sm:block">
                            <div>
                                <Avatar className=" w-11 h-11 ">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>Profile</AvatarFallback>
                                </Avatar>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-4 flex-col justify-between gap-5 bg-[#1A1A1D]   text-white cursor-pointer">

                            <div className="flex flex-col justify-start items-center gap-2">
                                <div >
                                    <Avatar className="w-14 h-15 ">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>Profile</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    {
                                        (user.email.includes("admin") && <Badge className="bg-[#63144c]">Admin</Badge>) 
                                    } 
                                </div>
                                <div>
                                    <Badge className="bg-[#63144c] text-wrap">{user.institutionDomain}</Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-4">
                                <span className="bg-[#63144c] p-1 rounded-[10px] text-center">{user.firstName + " " + user.lastName}</span>

                                {
                                    !user.email.includes("admin") ?
                                        <span className="bg-[#63144c] text-sm text-center p-1 rounded-[10px]">{user.departmentId.name}</span> : null
                                }

                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <div
                                        className="bg-red-700 p-1 rounded-[10px] text-center hover:bg-red-900 cursor-pointer mt-2"
                                        onClick={() => setOpen(true)}
                                    >
                                        Logout
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="bg-white">
                                    <DialogHeader>
                                        <DialogTitle>Are you sure you want to logout?</DialogTitle>
                                        <DialogDescription>
                                            You will be logged out and redirected to the home page.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                        <Button className="bg-red-600 text-white hover:bg-red-800" onClick={handleLogout}>Logout</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>



                        </HoverCardContent>
                    </HoverCard>
                }



            </div>
        </div>
    );
};


const ListItem = forwardRef(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});

ListItem.displayName = "ListItem";