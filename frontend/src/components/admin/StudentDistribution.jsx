import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, GraduationCap, BookOpen, Building, Calendar, User, LayoutDashboard, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/authSlice";
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CollegeOverview } from './CollegeOverview';

export const StudentDistribution = (props) => {
    return (
        <motion.div variants={props.cardVariants}>
            {
                props.studentDistribution.length > 0 ? 
                <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle>Student Distribution</CardTitle>
                    <CardDescription>By department</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={props.studentDistribution.length > 0 ? props.studentDistribution : [{ department: 'No Data', count: 1 }]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                animationBegin={300}
                                animationDuration={1500}
                            >
                                {props.studentDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card> : 
            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle>Add Students</CardTitle>
                    <CardDescription>There are no students added in the college database</CardDescription>
                </CardHeader>
            </Card>
            }
            
        </motion.div>
    )
}
