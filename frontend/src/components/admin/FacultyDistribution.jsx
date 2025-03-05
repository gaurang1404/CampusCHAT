import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export const FacultyDistribution = (props) => {
    return (
        <motion.div variants={props.cardVariants}>
            {
                props.faculty.length > 0 ?
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Faculty Distribution</CardTitle>
                            <CardDescription>By department</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={props.faculty.length > 0 ? props.faculty : [{ department: 'No Data', count: 0 }]}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <XAxis dataKey="department" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" animationBegin={300} animationDuration={1500}>
                                        {props.faculty.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    :
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Add Faculties</CardTitle>
                            <CardDescription>There are no faculties added in the college database</CardDescription>
                        </CardHeader>
                    </Card>
            }

        </motion.div>
    )
}
