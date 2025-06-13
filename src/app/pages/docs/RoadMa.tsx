import React, { useState } from 'react';
import { CheckCircle, Circle, Calendar, Code, Smartphone, Monitor, Globe, Server } from 'lucide-react';

const PosRoadmap = () => {
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [selectedWeek, setSelectedWeek] = useState('week1');

    const toggleTask = (taskId) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(taskId)) {
            newCompleted.delete(taskId);
        } else {
            newCompleted.add(taskId);
        }
        setCompletedTasks(newCompleted);
    };

    const weeks = {
        week1: {
            title: "Week 1-2: Multi-Tenant Foundation & Core API",
            icon: <Server className="w-5 h-5" />,
            color: "bg-blue-100 border-blue-300",
            tasks: [
                "Setup Node.js/Express TypeScript project structure",
                "Design multi-tenant database schema (shops, clients, workstations)",
                "Implement shop registration & client onboarding API",
                "Build workstation authentication system (client ID + till + auth key)",
                "Create tenant-aware CRUD API endpoints",
                "Setup API documentation with Swagger/OpenAPI",
                "Configure environment variables and multi-tenant security middleware"
            ]
        },
        week2: {
            title: "Week 3-4: Core POS Logic & PWA Foundation",
            icon: <Code className="w-5 h-5" />,
            color: "bg-green-100 border-green-300",
            tasks: [
                "Build inventory management API endpoints",
                "Implement transaction processing logic",
                "Create payment processing integration points",
                "Setup React PWA project with Vite",
                "Configure PWA manifest and service worker",
                "Build basic UI components and layout structure",
                "Implement API client with proper error handling"
            ]
        },
        week3: {
            title: "Week 5-6: UI Development & Business Logic",
            icon: <Monitor className="w-5 h-5" />,
            color: "bg-purple-100 border-purple-300",
            tasks: [
                "Build product catalog and search functionality",
                "Create shopping cart and checkout flow",
                "Implement receipt generation and printing",
                "Build inventory management interface",
                "Create sales reporting dashboard",
                "Add offline capability with local storage sync",
                "Implement barcode scanning (camera-based)"
            ]
        },
        week4: {
            title: "Week 7: Platform Builds & Testing",
            icon: <Smartphone className="w-5 h-5" />,
            color: "bg-orange-100 border-orange-300",
            tasks: [
                "Configure Electron Forge for desktop builds",
                "Setup Capacitor for Android builds",
                "Test PWA functionality across platforms",
                "Implement platform-specific features (native printing, etc.)",
                "Performance optimization and bundle analysis",
                "End-to-end testing across all platforms"
            ]
        },
        week5: {
            title: "Week 8: Deployment & Launch",
            icon: <Globe className="w-5 h-5" />,
            color: "bg-red-100 border-red-300",
            tasks: [
                "Deploy API to production (AWS/Digital Ocean/Heroku)",
                "Setup CI/CD pipeline for automated deployments",
                "Deploy web version and configure PWA hosting",
                "Package and test desktop application",
                "Build and test Android APK",
                "Final testing, bug fixes, and launch preparation",
                "Documentation and deployment guides"
            ]
        }
    };

    const getCompletionPercentage = () => {
        const totalTasks = Object.values(weeks).reduce((sum, week) => sum + week.tasks.length, 0);
        return Math.round((completedTasks.size / totalTasks) * 100);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">POS Development Roadmap</h1>
                <p className="text-gray-600 mb-4">
                    Node.js + Express API | React PWA | Electron + Capacitor + Vite
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm font-medium text-gray-700">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getCompletionPercentage()}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {Object.entries(weeks).map(([weekKey, week]) => (
                    <div
                        key={weekKey}
                        className={`rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedWeek === weekKey ? week.color : 'bg-white border-gray-200'
                            }`}
                        onClick={() => setSelectedWeek(weekKey)}
                    >
                        <div className="flex items-center mb-4">
                            {week.icon}
                            <h3 className="text-lg font-semibold ml-2">{week.title}</h3>
                        </div>
                        <div className="space-y-2">
                            {week.tasks.map((task, index) => {
                                const taskId = `${weekKey}-${index}`;
                                const isCompleted = completedTasks.has(taskId);
                                return (
                                    <div
                                        key={taskId}
                                        className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTask(taskId);
                                        }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                            {task}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Key Milestones & Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Critical Path Items:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• API authentication must be complete before UI development</li>
                            <li>• Transaction logic is core - prioritize this over advanced features</li>
                            <li>• Test offline functionality early and often</li>
                            <li>• Plan for payment integration complexity</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Platform Considerations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• PWA features work across all platforms</li>
                            <li>• Android may need native plugins for hardware</li>
                            <li>• Desktop app good for full-featured POS stations</li>
                            <li>• Consider responsive design for tablet use</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosRoadmap;