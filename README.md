# Kanban Board

A modern, interactive Kanban board application built with React, Vite, and Tailwind CSS. This project helps you visualize and manage tasks efficiently using the Kanban methodology.

## 🚀 Features

- **Drag and Drop**: Seamlessly move tasks between columns
- **Task Management**: Create, edit, and delete tasks with ease
- **Persistent Storage**: Tasks are saved using JSON Server
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS
- **Fast Development**: Powered by Vite for lightning-fast HMR (Hot Module Replacement)

## 🛠️ Tech Stack

- **React** - UI library for building the interface
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **JSON Server** - Mock REST API for data persistence
- **ESLint** - Code quality and consistency

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/mandloi15/Kanban-Board.git
cd Kanban-Board
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## 🚀 Running the Application

### Development Mode

1. Start the JSON Server (in one terminal):
```bash
npx json-server --watch db.json --port 3001
```

2. Start the development server (in another terminal):
```bash
npm run dev
# or
yarn dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Production Build

To create a production-ready build:
```bash
npm run build
# or
yarn build
```

To preview the production build:
```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
Kanban-Board/
├── public/              # Static assets
├── src/                 # Source files
│   ├── components/      # React components
│   ├── assets/          # Images, styles, etc.
│   └── App.jsx          # Main application component
├── db.json              # JSON Server database
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md            # Project documentation
```

## 📚 Documentation

Additional documentation files in this repository:

- **ADD_TASK_FLOW.md** - Details about the task creation flow
- **CODE_SNIPPETS.md** - Useful code snippets and patterns
- **FIXED_ADD_TASK.md** - Solutions to common task-related issues
- **IMPLEMENTATION_SUMMARY.md** - Overview of implementation details
- **README_ADD_TASK_FLOW.md** - Extended documentation on task management
- **TESTING_SCENARIOS.md** - Test cases and scenarios

## 🎯 Usage

1. **Creating Tasks**: Click the "Add Task" button to create a new task
2. **Moving Tasks**: Drag and drop tasks between columns (To Do, In Progress, Done)
3. **Editing Tasks**: Click on a task to edit its details
4. **Deleting Tasks**: Use the delete button on each task card

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

Please refer to the [Issues](https://github.com/mandloi15/Kanban-Board/issues) page for current bugs and feature requests.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**mandloi15**
- GitHub: [@mandloi15](https://github.com/mandloi15)

## 🙏 Acknowledgments

- React team for the amazing library
- Vite team for the blazing-fast build tool
- Tailwind CSS for the utility-first framework
- The open-source community for inspiration and resources

## 📧 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the existing documentation files
- Review the code snippets and implementation guides

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
