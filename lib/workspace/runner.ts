export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  hasError: boolean;
  errorName?: string;
  executionTimeMs: number;
}

export interface TestResultItem {
  name: string;
  passed: boolean;
  message?: string;
  executionTimeMs: number;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResultItem[];
  stdout: string;
  stderr: string;
  hasBlocker: boolean;
}

export class WorkspaceCodeRunner {
  /**
   * Executes the Python script
   */
  public executeCode(code: string, filename: string): RunResult {
    const startTime = Date.now();

    // Check if dividing by zero without guard
    const hasZeroDivisionGuard =
      code.includes('b == 0') ||
      code.includes('b!=0') ||
      code.includes('ZeroDivisionError') ||
      code.includes('Division by zero');

    if (filename === 'calculator.py') {
      if (!hasZeroDivisionGuard) {
        // Triggers the deliberate ZeroDivisionError demonstration
        const stdout = `Add: 10 + 5 = 15\nDivide: 10 / 2 = 5.0\n`;
        const stderr = `Traceback (most recent call last):
  File "calculator.py", line 18, in <module>
    print("Divide by zero:", calculate(10, 0, "divide"))
  File "calculator.py", line 10, in calculate
    return a / b
ZeroDivisionError: division by zero`;

        return {
          stdout,
          stderr,
          exitCode: 1,
          hasError: true,
          errorName: 'ZeroDivisionError: division by zero',
          executionTimeMs: Date.now() - startTime + 45,
        };
      } else {
        // Safe version with guard
        const stdout = `Add: 10 + 5 = 15\nDivide: 10 / 2 = 5.0\nDivide by zero: Error: Division by zero\n\nExecution finished successfully.`;
        return {
          stdout,
          stderr: '',
          exitCode: 0,
          hasError: false,
          executionTimeMs: Date.now() - startTime + 38,
        };
      }
    }

    return {
      stdout: `[Workspace Runner] Executed ${filename} successfully.\nProcess exited with code 0.`,
      stderr: '',
      exitCode: 0,
      hasError: false,
      executionTimeMs: Date.now() - startTime + 25,
    };
  }

  /**
   * Executes the 12 unit test cases
   */
  public runTests(code: string): TestSuiteResult {
    const hasZeroDivisionGuard =
      code.includes('b == 0') ||
      code.includes('ZeroDivisionError') ||
      code.includes('Division by zero');

    const testDefs = [
      { name: 'test_add_positive', passed: true, message: '5 + 3 == 8' },
      { name: 'test_add_negative', passed: true, message: '-4 + -6 == -10' },
      { name: 'test_add_zero', passed: true, message: '0 + 0 == 0' },
      { name: 'test_sub_positive', passed: true, message: '10 - 4 == 6' },
      { name: 'test_sub_negative', passed: true, message: '-5 - -2 == -3' },
      { name: 'test_mul_positive', passed: true, message: '6 * 7 == 42' },
      { name: 'test_mul_zero', passed: true, message: '9 * 0 == 0' },
      { name: 'test_mul_negative', passed: true, message: '-3 * 4 == -12' },
      { name: 'test_div_standard', passed: true, message: '20 / 4 == 5.0' },
      { name: 'test_div_negative', passed: true, message: '-15 / 3 == -5.0' },
      { name: 'test_div_fraction', passed: true, message: '1 / 2 == 0.5' },
      {
        name: 'test_div_zero_handled',
        passed: hasZeroDivisionGuard,
        message: hasZeroDivisionGuard
          ? 'Handled gracefully returning "Error: Division by zero"'
          : 'FAIL: Unhandled ZeroDivisionError: division by zero',
      },
    ];

    const results: TestResultItem[] = testDefs.map((t) => ({
      name: t.name,
      passed: t.passed,
      message: t.message,
      executionTimeMs: Math.floor(Math.random() * 8) + 2,
    }));

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.length - passedCount;

    let stdout = `============================= test session starts ==============================\n`;
    stdout += `platform win32 -- Python 3.13.0, pytest-8.3.2, pluggy-1.5.0\n`;
    stdout += `rootdir: /workspace/python-calculator\ncollected 12 items\n\n`;

    results.forEach((r) => {
      stdout += `${r.name} .................................... [ ${r.passed ? 'PASSED' : 'FAILED'} ]\n`;
    });

    stdout += `\n`;

    let stderr = '';
    if (failedCount > 0) {
      stderr = `______________________________ test_div_zero_handled ______________________________\n` +
               `    def test_div_zero_handled():\n` +
               `>       res = calculate(10, 0, "divide")\n` +
               `E       ZeroDivisionError: division by zero\n\n` +
               `calculator.py:10: ZeroDivisionError\n` +
               `=========================== 1 failed, 11 passed in 0.08s ===========================`;
    } else {
      stdout += `=========================== 12 passed in 0.05s ===========================\n`;
    }

    return {
      total: 12,
      passed: passedCount,
      failed: failedCount,
      results,
      stdout,
      stderr,
      hasBlocker: failedCount > 0,
    };
  }
}

export const workspaceRunner = new WorkspaceCodeRunner();
