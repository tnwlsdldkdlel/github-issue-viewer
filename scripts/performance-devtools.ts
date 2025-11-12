/**
 * Chrome DevTools Performance 자동화 스크립트
 * Puppeteer를 사용하여 사용자 상호작용을 시뮬레이션하고 Performance API로 측정합니다.
 * Lighthouse와 달리 이미 로드된 페이지의 현재 상태를 측정할 수 있습니다.
 */

import puppeteer, { Page, Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const URL = 'http://localhost:3003';
const OUTPUT_DIR = path.join(process.cwd(), 'docs/performance');

interface TestScenario {
  name: string;
  description: string;
  setup: (page: Page) => Promise<void>;
}

interface PerformanceMetrics {
  timestamp: string;
  scenario: string;
  metrics: {
    // Performance API 메트릭
    domContentLoaded?: number;
    loadComplete?: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
    // 커스텀 메트릭
    domNodes: number;
    memoryUsage?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    issueCount: number;
    // 스크롤 성능 (있는 경우)
    scrollPerformance?: {
      averageFPS?: number;
      minFPS?: number;
    };
  };
}

/**
 * 시나리오 1: 초기 로드 (100개 이슈)
 */
const initialLoadScenario: TestScenario = {
  name: 'initial-load',
  description: '초기 페이지 로드 (100개 이슈)',
  setup: async (page) => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[class*="border-b"]', { timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 추가 대기
  },
};

/**
 * 시나리오 2: 500개 이슈 로드
 */
const load500IssuesScenario: TestScenario = {
  name: 'load-500-issues',
  description: '500개 이슈 로드 후 측정',
  setup: async (page) => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[class*="border-b"]', { timeout: 30000 });
    
    // "더 보기" 버튼을 4번 클릭 (100개 → 500개)
    for (let i = 0; i < 4; i++) {
      const buttonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
        if (btn && !btn.disabled) {
          btn.click();
          return true;
        }
        return false;
      });
      
      if (buttonFound) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await page.waitForFunction(
          () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
            return !btn || !btn.disabled;
          },
          { timeout: 10000 }
        );
      } else {
        console.log(`"더 보기" 버튼을 찾을 수 없습니다. (${i + 1}번째 시도)`);
        break;
      }
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },
};

/**
 * 시나리오 3: 1000개 이슈 로드
 */
const load1000IssuesScenario: TestScenario = {
  name: 'load-1000-issues',
  description: '1000개 이슈 로드 후 측정',
  setup: async (page) => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[class*="border-b"]', { timeout: 30000 });
    
    // "더 보기" 버튼을 9번 클릭 (100개 → 1000개)
    for (let i = 0; i < 9; i++) {
      const buttonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
        if (btn && !btn.disabled) {
          btn.click();
          return true;
        }
        return false;
      });
      
      if (buttonFound) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await page.waitForFunction(
          () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
            return !btn || !btn.disabled;
          },
          { timeout: 10000 }
        );
      } else {
        console.log(`"더 보기" 버튼을 찾을 수 없습니다. (${i + 1}번째 시도)`);
        break;
      }
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },
};

/**
 * 시나리오 4: 스크롤 성능 테스트
 */
const scrollPerformanceScenario: TestScenario = {
  name: 'scroll-performance',
  description: '500개 이슈 로드 후 스크롤 성능 측정',
  setup: async (page) => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[class*="border-b"]', { timeout: 30000 });
    
    // 500개 이슈 로드
    for (let i = 0; i < 4; i++) {
      const buttonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
        if (btn && !btn.disabled) {
          btn.click();
          return true;
        }
        return false;
      });
      
      if (buttonFound) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await page.waitForFunction(
          () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find((b) => b.textContent?.includes('더 보기')) as HTMLButtonElement;
            return !btn || !btn.disabled;
          },
          { timeout: 10000 }
        );
      } else {
        break;
      }
    }
    
    // 스크롤 동작 수행
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            setTimeout(() => resolve(), 1000);
          }
        }, 100);
      });
    });
  },
};

/**
 * Performance API를 사용하여 현재 페이지 상태 측정
 */
async function measurePerformanceMetrics(
  page: Page,
  scenario: TestScenario
): Promise<PerformanceMetrics> {
  // Performance API 메트릭 수집
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    
    // DOM 노드 수
    const domNodes = document.querySelectorAll('*').length;
    
    // 이슈 아이템 수 (border-b 클래스를 가진 요소)
    const issueItems = document.querySelectorAll('[class*="border-b"]').length;
    
    // 메모리 사용량 (가능한 경우)
    const memory = (performance as any).memory;
    
    return {
      domContentLoaded: perfData?.domContentLoadedEventEnd ? perfData.domContentLoadedEventEnd : undefined,
      loadComplete: perfData?.loadEventEnd ? perfData.loadEventEnd : undefined,
      firstPaint: firstPaint ? firstPaint.startTime : undefined,
      firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : undefined,
      domNodes,
      memoryUsage: memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      } : undefined,
      issueCount: issueItems,
    };
  });

  // 스크롤 성능 측정 (스크롤 시나리오인 경우)
  let scrollPerformance: { averageFPS?: number; minFPS?: number } | undefined;
  if (scenario.name === 'scroll-performance') {
    // FPS 측정은 복잡하므로 간단한 추정값 사용
    // 실제로는 requestAnimationFrame을 사용하여 측정해야 함
    scrollPerformance = {
      averageFPS: undefined, // 실제 측정 필요
      minFPS: undefined, // 실제 측정 필요
    };
  }

  return {
    timestamp: new Date().toISOString(),
    scenario: scenario.name,
    metrics: {
      ...metrics,
      scrollPerformance,
    },
  };
}

/**
 * Performance 측정 실행
 */
async function runPerformanceMeasurement(
  browser: Browser,
  scenario: TestScenario
): Promise<void> {
  console.log(`\n📊 측정 시작: ${scenario.description}`);

  const page = await browser.newPage();
  
  try {
    // Performance API 활성화
    await page.setCacheEnabled(false);
    
    // 시나리오 설정 (페이지 로드 및 상호작용)
    await scenario.setup(page);

    console.log(`   페이지 준비 완료: ${page.url()}`);

    // Performance 메트릭 수집
    console.log(`   Performance 메트릭 수집 중...`);
    const performanceMetrics = await measurePerformanceMetrics(page, scenario);

    // 결과 저장
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `devtools-${scenario.name}-${timestamp}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(performanceMetrics, null, 2));

    // 요약 정보 출력
    console.log(`   ✅ 측정 완료: ${filename}`);
    console.log(`   DOM 노드 수: ${performanceMetrics.metrics.domNodes.toLocaleString()}개`);
    console.log(`   이슈 아이템 수: ${performanceMetrics.metrics.issueCount}개`);
    if (performanceMetrics.metrics.memoryUsage) {
      const usedMB = (performanceMetrics.metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`   메모리 사용량: ${usedMB} MB`);
    }
    if (performanceMetrics.metrics.firstContentfulPaint) {
      console.log(`   FCP: ${(performanceMetrics.metrics.firstContentfulPaint / 1000).toFixed(2)}초`);
    }

  } catch (error) {
    console.error(`   ❌ 측정 실패:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const scenarioName = process.argv[2] || 'all';

  console.log('🚀 Chrome DevTools Performance 측정 자동화 시작');
  console.log(`   URL: ${URL}`);
  console.log(`   시나리오: ${scenarioName}`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const scenarios: TestScenario[] = [
      initialLoadScenario,
      load500IssuesScenario,
      load1000IssuesScenario,
      scrollPerformanceScenario,
    ];

    if (scenarioName === 'all') {
      // 모든 시나리오 실행
      for (const scenario of scenarios) {
        await runPerformanceMeasurement(browser, scenario);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } else {
      // 특정 시나리오만 실행
      const scenario = scenarios.find((s) => s.name === scenarioName);
      if (scenario) {
        await runPerformanceMeasurement(browser, scenario);
      } else {
        console.error(`시나리오를 찾을 수 없습니다: ${scenarioName}`);
        console.log('사용 가능한 시나리오:');
        scenarios.forEach((s) => console.log(`  - ${s.name}: ${s.description}`));
        process.exit(1);
      }
    }

    console.log('\n✅ 모든 측정 완료!');
  } catch (error) {
    console.error('❌ 측정 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// 스크립트 실행
main().catch(console.error);

