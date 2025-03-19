"use client"

import { forwardRef } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet.jsx"
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

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { logout } from "@/redux/authSlice"

import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"

export const NavBar = () => {
  const [open, setOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  const collegeERP = [
    {
      title: "Admin & Department Management",
      description: "Handles the structure of the institution, including department creation, role assignments, and administrative controls.",
    },
    {
      title: "Semester & Course Management",
      description: "Manages academic sessions, course registrations, syllabus distribution, and scheduling.",
    },
    {
      title: "Faculty & Student Management",
      description: "Maintains faculty profiles, student records, and role-based access to information and resources.",
    },
    {
      title: "Attendance & Marks Management",
      description: "Automates attendance tracking, marks entry, and report generation for academic performance analysis.",
    },
];

  return (
    <div
      style={{ border: "none" }}
      className="w-full bg-gradient-to-r from-[#63144c] to-[#4a0f39] sticky top-0 z-50 shadow-md"
    >
      <div
        style={{ border: "none" }}
        className="lg:max-w-[1400px] m-auto flex justify-between items-center gap-2 p-4 h-[4.5rem]"
      >
        <div className="flex justify-center items-center">
          <NavigationMenu style={{ border: "none" }}>
            <NavigationMenuList style={{ border: "none" }}>
              <NavigationMenuItem>
                <Link to="/" className="text-2xl font-bold text-white mr-8">
                  Campus<span className="font-extrabold">CHAT</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem style={{ border: "none" }}>
                <NavigationMenuTrigger
                  style={{ border: "none" }}
                  className="text-white px-4 py-2  transition [&>svg]:text-white bg-white/10 hover:bg-white/20 border-none"
                >
                  <span className="text-white text-[15px] border-none">Getting Started</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#63144c] text-white p-4" style={{ border: "none" }}>
                  <ul className="grid gap-3 p-4 w-[250px] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end hover:bg-[#37102d] rounded-xl p-6 no-underline outline-none focus:shadow-md transition"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">Campus Portal</div>
                          <p className="text-sm leading-tight text-gray-300">
                            Smart platform for students, faculty, and administrators.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="/"
                      title="Student Portal"
                      className="text-gray-200 hover:text-white hover:bg-[#37102d]"
                    >
                      Access your courses, assignments, study tools, and more.
                    </ListItem>
                    <ListItem
                      href="/"
                      title="Faculty Portal"
                      className="text-gray-200 hover:text-white hover:bg-[#37102d]"
                    >
                      Manage courses, student progress, and analytics.
                    </ListItem>
                    <ListItem
                      href="/"
                      title="Admin Panel"
                      className="text-gray-200 hover:text-white hover:bg-[#37102d]"
                    >
                      Oversee campus activities and institution-wide analytics.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="hidden sm:block">
  <NavigationMenuTrigger className="text-white px-4 py-2  transition [&>svg]:text-white bg-white/10 hover:bg-white/20">
    <span className="text-white text-[15px]">Campus Portal</span>
  </NavigationMenuTrigger>
  <NavigationMenuContent className="bg-[#63144c] text-white p-4">
    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
      {collegeERP.map((item) => (
        <ListItem className="hover:bg-[#37102d]" key={item.title} title={item.title}>
          {item.description}
        </ListItem>
      ))}
    </ul>
  </NavigationMenuContent>
</NavigationMenuItem>

              {user && (
                <NavigationMenuItem className="hidden sm:flex justify-center items-center">
                  {user.role === "Admin" && (
                    <Link className="text-white mr-3 hover:text-white/80 px-4 py-2" to={"/admin-dashboard"}>
                      Dashboard
                    </Link>
                  )}
                  {user.role === "Faculty" && (
                    <Link className="text-white mr-3 hover:text-white/80 px-4 py-2" to={"/faculty-dashboard"}>
                      Dashboard
                    </Link>
                  )}
                  {user.role === "Student" && (
                    <Link className="text-white mr-3 hover:text-white/80 px-4 py-2" to={"/student-dashboard"}>
                      Dashboard
                    </Link>
                  )}
                </NavigationMenuItem>
              )}

              {!user && (
                <NavigationMenuItem className="hidden sm:flex justify-center items-center">
                  <Link
                    className="text-white mr-3 hover:text-white/80 px-4 py-2"
                    href={"#dashboard"}
                    onClick={(e) => {
                      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    Dashboard
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {user && (
          <Sheet onOpenChange={setIsOpen}>
            <SheetTrigger>
              <div className="sm:hidden">
                <div className="flex flex-col justify-between w-6 h-4 group" onClick={() => setIsOpen(!isOpen)}>
                  <span
                    className={`h-[2px] w-full bg-white rounded transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2.5" : ""}`}
                  ></span>
                  <span
                    className={`h-[2px] w-full bg-white rounded transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}
                  ></span>
                  <span
                    className={`h-[2px] w-full bg-white rounded transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`}
                  ></span>
                </div>
              </div>
            </SheetTrigger>
            <SheetContent className="sm:hidden bg-[#63144c] text-white w-64 h-full p-4">
              <SheetHeader>
                <SheetTitle className="text-lg font-bold text-white">CampusCHAT</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex justify-between gap-5 bg-[#37102d] p-4 border border-white/20 rounded-xl">
                <div className="flex flex-col justify-start items-center gap-2">
                  <div>
                    <Avatar className="w-14 h-15 border-2 border-white/20">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>Profile</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    {user?.role === "Admin" && <Badge className="bg-[#63144c]">Admin</Badge>}
                    {user?.role === "Student" && <Badge className="bg-[#63144c]">Student</Badge>}
                    {user?.role === "Faculty" && <Badge className="bg-[#63144c]">Faculty</Badge>}
                  </div>
                  <div>
                    {user.role == "Admin" && <Badge className="bg-[#63144c]">{user.institutionDomain}</Badge>}
                    {user.role == "Student" && <Badge className="bg-[#63144c]">{user.departmentId.name}</Badge>}
                    {user.role == "Faculty" && <Badge className="bg-[#63144c]">{user.departmentId.name}</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="bg-[#63144c] p-1 rounded-lg text-center">
                    {user.firstName + " " + user.lastName}
                  </span>

                  <span className="bg-[#63144c] text-sm text-center p-1 rounded-lg">
                    {user && user.role === "Admin"
                      ? user.institutionName.length > 15
                        ? user.institutionName.substring(0, 12) + "..."
                        : user.institutionName
                      : user.departmentId.length > 15
                        ? user.departmentId.substring(0, 12) + "..."
                        : user.departmentId}
                  </span>
                </div>
              </div>
              <nav className="bg-[#63144c] w-full m-auto rounded-b-2xl pt-6 text-center pb-6">
                <ul className="space-y-4">
                  {user && user.role === "Admin" && (
                    <Link to={"/admin-dashboard"}>
                      <li className="bg-[#37102d] shadow-lg w-[90%] m-auto hover:bg-[#1e0b18] p-3 rounded-lg cursor-pointer">
                        Dashboard
                      </li>
                    </Link>
                  )}
                  {user && user.role === "Student" && (
                    <Link to={"/student-dashboard"}>
                      <li className="bg-[#37102d] shadow-lg w-[90%] m-auto hover:bg-[#1e0b18] p-3 rounded-lg cursor-pointer">
                        Dashboard
                      </li>
                    </Link>
                  )}
                  {user && user.role === "Faculty" && (
                    <Link to={"/faculty-dashboard"}>
                      <li className="bg-[#37102d] shadow-lg w-[90%] m-auto hover:bg-[#1e0b18] p-3 rounded-lg cursor-pointer">
                        Dashboard
                      </li>
                    </Link>
                  )}

                  <li className="bg-[#37102d] w-[90%] m-auto hover:bg-[#1e0b18] p-3 rounded-lg cursor-pointer">
                    Profile
                  </li>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <li className="bg-red-700 w-[90%] m-auto hover:bg-red-900 p-3 rounded-lg cursor-pointer">
                        Logout
                      </li>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Are you sure you want to logout?</DialogTitle>
                        <DialogDescription>You will be logged out and redirected to the home page.</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-red-600 text-white hover:bg-red-800" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        )}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer hidden sm:block focus:outline-none">
              <div>
                <Avatar className="w-11 h-11 border-2 border-white/20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>Profile</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 flex-col justify-between gap-5 bg-[#37102d] text-white cursor-pointer border border-white/20">
              <div className="flex flex-col justify-start items-center gap-2">
                <div>
                  <Avatar className="w-14 h-15 border-2 border-white/20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Profile</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  {user && user.role === "Admin" && <Badge className="bg-[#63144c]">Admin</Badge>}
                  {user && user.role === "Student" && <Badge className="bg-[#63144c]">Student</Badge>}
                  {user && user.role === "Faculty" && <Badge className="bg-[#63144c]">Faculty</Badge>}
                </div>
                <div>
                  <Badge className="bg-[#63144c] text-wrap">{user.institutionDomain}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <span className="bg-[#63144c] p-1 rounded-lg text-center">{user.firstName + " " + user.lastName}</span>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <div
                    className="bg-red-700 p-1 rounded-lg text-center hover:bg-red-900 cursor-pointer mt-2"
                    onClick={() => setOpen(true)}
                  >
                    Logout
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to logout?</DialogTitle>
                    <DialogDescription>You will be logged out and redirected to the home page.</DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-red-600 text-white hover:bg-red-800" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

const ListItem = forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})

ListItem.displayName = "ListItem"

