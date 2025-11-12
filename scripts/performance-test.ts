/**
 * 성능 측정 자동화 스크립트
 * Puppeteer를 사용하여 사용자 상호작용을 시뮬레이션하고 Lighthouse로 측정합니다.
 */

import puppeteer, { Page, Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const URL = 'http://localhost:3003';
const OUTPUT_DIR = path.join(process.cwd(), 'docs/performance');

interface TestScenario {
  name: string;
  description: string;
  setup: (page: Page) => Promise<void>;
}

/**
 * 시나리오 1: 초기 로드 (100개 이슈)
 */
const initialLoadScenario: TestScenario = {
  name: 'initial-load',
  description: '초기 페이지 로드 (100개 이슈)',
  setup: async (page) => {
    await page.goto(URL, { waitUntil: 'networkidle0' });
    // 이슈 목록이 로드될 때까지 대기
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
        // 로딩 완료 대기
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // 버튼이 disabled 상태에서 해제될 때까지 대기
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
    
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 최종 대기
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
            // 다시 위로 스크롤
            window.scrollTo(0, 0);
            setTimeout(() => resolve(), 1000);
          }
        }, 100);
      });
    });
  },
};

/**
 * Lighthouse 측정 실행
 */
async function runLighthouseMeasurement(
  browser: Browser,
  scenario: TestScenario
): Promise<void> {
  console.log(`\n📊 측정 시작: ${scenario.description}`);

  const page = await browser.newPage();
  
  try {
    // 시나리오 설정 (페이지 로드 및 상호작용)
    await scenario.setup(page);

    // 현재 페이지 URL 가져오기
    const currentUrl = page.url();
    const wsEndpoint = browser.wsEndpoint();
    let port = '9222';
    if (wsEndpoint && typeof wsEndpoint === 'string') {
      try {
        // ws://127.0.0.1:9222/devtools/browser/... 형식에서 포트 추출
        const match = wsEndpoint.match(/ws:\/\/[^:]+:(\d+)/);
        if (match) {
          port = match[1];
        }
      } catch {
        // URL 파싱 실패 시 기본값 사용
      }
    }

    console.log(`   페이지 준비 완료: ${currentUrl}`);

    // Lighthouse 측정 실행 (CLI로 실행)
    console.log(`   Lighthouse 측정 중...`);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${scenario.name}-${timestamp}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Lighthouse CLI 실행 (npx 사용)
    const lighthouseCommand = `npx lighthouse "${currentUrl}" --output json --output-path "${filepath}" --chrome-flags="--headless" --quiet`;
    
    try {
      execSync(lighthouseCommand, { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
      // Lighthouse CLI는 종료 코드가 0이 아닐 수 있지만 결과 파일은 생성됨
      if (!fs.existsSync(filepath)) {
        throw new Error('Lighthouse 측정 실패: 결과 파일이 생성되지 않았습니다.');
      }
    }

    // 결과 파일 읽기 및 요약 정보 출력
    if (fs.existsSync(filepath)) {
      const resultData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      const categories = resultData.categories;
      console.log(`   ✅ 측정 완료: ${filename}`);
      const performanceScore = categories?.performance?.score;
      console.log(`   Performance: ${performanceScore ? Math.round(performanceScore * 100) : 'N/A'}`);
      console.log(`   FCP: ${resultData.audits?.['first-contentful-paint']?.displayValue || 'N/A'}`);
      console.log(`   LCP: ${resultData.audits?.['largest-contentful-paint']?.displayValue || 'N/A'}`);
      console.log(`   TBT: ${resultData.audits?.['total-blocking-time']?.displayValue || 'N/A'}`);
    } else {
      throw new Error('Lighthouse 측정 결과 파일을 찾을 수 없습니다.');
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

  console.log('🚀 성능 측정 자동화 시작');
  console.log(`   URL: ${URL}`);
  console.log(`   시나리오: ${scenarioName}`);

  const browser = await puppeteer.launch({
    headless: false, // 브라우저를 보이게 하여 디버깅 가능
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
        await runLighthouseMeasurement(browser, scenario);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 시나리오 간 대기
      }
    } else {
      // 특정 시나리오만 실행
      const scenario = scenarios.find((s) => s.name === scenarioName);
      if (scenario) {
        await runLighthouseMeasurement(browser, scenario);
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

