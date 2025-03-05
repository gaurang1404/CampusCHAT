import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export const CollegeOverview = (props) => {
    return (
        <motion.div className="col-span-1 md:col-span-2" variants={props.cardVariants}>
            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle>College Overview</CardTitle>
                    <CardDescription>Key metrics from real-time data</CardDescription>
                </CardHeader>
                <CardContent>
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        variants={props.containerVariants}
                    >
                        <motion.div
                            className="bg-blue-100 p-4 rounded-lg flex flex-col items-center"
                            variants={props.itemVariants}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <Users className="h-8 w-8 text-blue-500 mb-2" />
                            <h3 className="text-xl font-bold">{props.students.length}</h3>
                            <p className="text-sm text-gray-600">Total Students</p>
                        </motion.div>
                        <motion.div
                            className="bg-green-100 p-4 rounded-lg flex flex-col items-center"
                            variants={props.itemVariants}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <GraduationCap className="h-8 w-8 text-green-500 mb-2" />
                            <h3 className="text-xl font-bold">{props.faculty.length}</h3>
                            <p className="text-sm text-gray-600">Faculty Members</p>
                        </motion.div>
                        <motion.div
                            className="bg-yellow-100 p-4 rounded-lg flex flex-col items-center"
                            variants={props.itemVariants}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <BookOpen className="h-8 w-8 text-yellow-500 mb-2" />
                            <h3 className="text-xl font-bold">{props.courses.length}</h3>
                            <p className="text-sm text-gray-600">Active Courses</p>
                        </motion.div>
                        <motion.div
                            className="bg-purple-100 p-4 rounded-lg flex flex-col items-center"
                            variants={props.itemVariants}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <Building className="h-8 w-8 text-purple-500 mb-2" />
                            <h3 className="text-xl font-bold">{props.departments.length}</h3>
                            <p className="text-sm text-gray-600">Departments</p>
                        </motion.div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
