
# CU Scheduler

This is a project to improve the experience of building a course schedule for CU students. It is a website that lets you build a schedule around which hours you will be available, and also lets you avoid waitlisted classes. This is a personal project that I created, and not affiliated with the university.

See the deployed project at [cuscheduler.com](www.cuscheduler.com)!

## Details

This project uses Integer Linear Programming (ILP) under the hood to optimize the placement of classes by minimizing a cost function. There are many factors that go into the cost function, such as if it is marked to avoid the timeframe or if the professor is marked as unpreferred. This site is developed with Next.JS on the front- and back-end.

![Homepage Screenshot](public/cuscheduler_screenshot.png)