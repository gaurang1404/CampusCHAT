import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

export const EnrollmentDetails = (props) => {
    return (
        <motion.div className="col-span-1 md:col-span-2" variants={props.cardVariants}>
            {
                props.enrollmentTrend.length > 0 ?
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Enrollment Trends</CardTitle>
                            <CardDescription>Student enrollment over recent semesters</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={props.enrollmentTrend}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <XAxis dataKey="semester" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="students"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                        animationBegin={300}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    :
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Enroll Students</CardTitle>
                            <CardDescription>There are no students added in the college database</CardDescription>
                        </CardHeader>
                    </Card>

            }

        </motion.div>
    )
}
