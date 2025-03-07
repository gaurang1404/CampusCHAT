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

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#A28BFE', '#50C878', '#E6194B', '#3CB44B', '#FFE119',
    '#4363D8', '#F58231', '#911EB4', '#46F0F0', '#F032E6',
    '#BCF60C', '#FABEBE', '#008080', '#E6BEFF', '#9A6324'
  ];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {        
        
        return (
            <div className="bg-white p-2 shadow-lg border rounded-md text-xs">
                <p className="font-bold">{payload[0].payload.department}</p>
                <p>{`Count: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

export const StudentDistribution = (props) => {
       
    return (
        <motion.div variants={props.cardVariants}>
            {props.studentDistribution.length > 0 ? 
                <Card className="border-none shadow-xl relative">
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                        <CardDescription>By department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart className="relative z-10">
                                <Pie
                                    data={props.studentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ department, percent, x, y }) => (
                                        <text
                                            x={x}
                                            y={y}
                                            textAnchor="middle"
                                            fill="#333"
                                            fontSize="12px"
                                            fontWeight="bold"
                                        >
                                            <tspan x={x} dy="-5">{department}</tspan>
                                            <tspan x={x} dy="15">{`${(percent * 100).toFixed(0)}%`}</tspan>
                                        </text>
                                    )}
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
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card> 
                : 
                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle>Add Students</CardTitle>
                        <CardDescription>There are no students added in the college database</CardDescription>
                    </CardHeader>
                </Card>
            }
        </motion.div>
    );
};
