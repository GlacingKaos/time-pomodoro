import { TimePomodoroPage } from './app.po';

describe('time-pomodoro App', () => {
  let page: TimePomodoroPage;

  beforeEach(() => {
    page = new TimePomodoroPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
