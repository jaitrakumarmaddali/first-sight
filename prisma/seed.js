const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_FILES = {
  "calculator.py": `def calculate(a, b, operation):
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        return a / b
    return None

if __name__ == "__main__":
    print("Add: 10 + 5 =", calculate(10, 5, "add"))
    print("Divide: 10 / 2 =", calculate(10, 2, "divide"))
    print("Divide by zero:", calculate(10, 0, "divide"))
`,
  "tests.py": `# Python Calculator Comprehensive Test Suite
# Tests standard operations, boundary values, and zero division handling

def run_suite(calc_fn):
    tests = [
        ("test_add_positive", lambda: calc_fn(5, 3, "add") == 8),
        ("test_add_negative", lambda: calc_fn(-4, -6, "add") == -10),
        ("test_add_zero", lambda: calc_fn(0, 0, "add") == 0),
        ("test_sub_positive", lambda: calc_fn(10, 4, "subtract") == 6),
        ("test_sub_negative", lambda: calc_fn(-5, -2, "subtract") == -3),
        ("test_mul_positive", lambda: calc_fn(6, 7, "multiply") == 42),
        ("test_mul_zero", lambda: calc_fn(9, 0, "multiply") == 0),
        ("test_mul_negative", lambda: calc_fn(-3, 4, "multiply") == -12),
        ("test_div_standard", lambda: calc_fn(20, 4, "divide") == 5.0),
        ("test_div_negative", lambda: calc_fn(-15, 3, "divide") == -5.0),
        ("test_div_fraction", lambda: calc_fn(1, 2, "divide") == 0.5),
        ("test_div_zero_handled", lambda: calc_fn(10, 0, "divide") == "Error: Division by zero" or calc_fn(10, 0, "divide") is None),
    ]
    return tests
`,
  "README.md": `# Python Calculator Project

A lightweight arithmetic calculation module designed for high reliability.

### Target Specifications:
- Robust error handling for arithmetic edge cases.
- Division by zero safety guard to prevent runtime crashes.
- 100% test coverage across 12 test assertions.

### Current Implementation Status:
- [x] Basic arithmetic operations implemented
- [x] Input parameters mapped
- [ ] Safe denominator validation in progress
- [ ] Verification suite passing
`
};

async function main() {
  console.log("Seeding database with default workspace and task data...");

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email: "engineer@firstsight.ai" },
    update: {},
    create: {
      email: "engineer@firstsight.ai",
      name: "Alex Vance",
      avatar: "/avatar.png"
    }
  });

  // Upsert workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "python-calculator" },
    update: {
      filesData: JSON.stringify(DEFAULT_FILES),
      activeFile: "calculator.py"
    },
    create: {
      name: "Python Calculator",
      slug: "python-calculator",
      description: "Core arithmetic calculation engine with edge validation",
      activeFile: "calculator.py",
      filesData: JSON.stringify(DEFAULT_FILES),
      focusTimeMinutes: 42
    }
  });

  // Upsert Task
  let task = await prisma.task.findFirst({
    where: { workspaceId: workspace.id, title: "Build Python Calculator" }
  });

  if (!task) {
    task = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        title: "Build Python Calculator",
        description: "Implement arithmetic operations with comprehensive error handling and test verification.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 78,
        subtasks: {
          create: [
            { title: "Create interface", completed: true, order: 1 },
            { title: "Add input handling", completed: true, order: 2 },
            { title: "Handle errors", completed: false, order: 3 },
            { title: "Write tests", completed: false, order: 4 },
          ]
        }
      }
    });
  }

  // Upsert AI Configuration
  await prisma.aIConfiguration.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      flashModel: "gemini-3.8-flash",
      gemmaModel: "Gemma 4 E2B/E4B",
      liveModel: "gemini-3.8-live",
      ttsModel: "gemini-3.8-flash-tts",
      transcribeModel: "gemini-3.5-transcribe",
      visionModel: "gemini-omni-1.1-flash",
      monitoringActive: true,
      autoSuggest: true,
      sensitivity: "HIGH",
      isDemoMode: true
    }
  });

  // Seed sample initial activities
  const existingActivities = await prisma.activityEvent.count({ where: { workspaceId: workspace.id } });
  if (existingActivities === 0) {
    const initialEvents = [
      {
        workspaceId: workspace.id,
        eventType: "FILE_OPENED",
        category: "FILES",
        description: "calculator.py opened in editor",
        metadata: JSON.stringify({ file: "calculator.py" }),
        isSignificant: true,
        gemmaClass: "FILE_INTERACTION",
        timestamp: new Date(Date.now() - 35 * 60 * 1000)
      },
      {
        workspaceId: workspace.id,
        eventType: "FILE_EDITED",
        category: "FILES",
        description: "Added division operation handler",
        metadata: JSON.stringify({ file: "calculator.py", linesChanged: 4 }),
        isSignificant: true,
        gemmaClass: "CODE_MODIFICATION",
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        workspaceId: workspace.id,
        eventType: "FILE_SAVED",
        category: "FILES",
        description: "Saved calculator.py changes",
        metadata: JSON.stringify({ file: "calculator.py" }),
        isSignificant: true,
        gemmaClass: "FILE_PERSIST",
        timestamp: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        workspaceId: workspace.id,
        eventType: "TASK_UPDATED",
        category: "SYSTEM",
        description: "Task 'Build Python Calculator' progress updated to 78%",
        metadata: JSON.stringify({ progress: 78 }),
        isSignificant: true,
        gemmaClass: "TASK_PROGRESS",
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ];

    for (const evt of initialEvents) {
      await prisma.activityEvent.create({ data: evt });
    }
  }

  // Seed notification
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.create({
      data: {
        title: "First Sight AI Active",
        message: "Continuous proactive monitoring initialized for workspace 'Python Calculator'.",
        type: "INFO",
        read: false
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
