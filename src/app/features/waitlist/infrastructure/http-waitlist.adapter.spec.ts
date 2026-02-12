import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { HttpWaitlistAdapter } from '@app/features/waitlist/infrastructure/http-waitlist.adapter'
import { JoinWaitlistRequest } from '@app/features/waitlist/domain/waitlist.model'

describe('HttpWaitlistAdapter', () => {
  let adapter: HttpWaitlistAdapter
  let fetchSpy: jasmine.Spy<typeof fetch>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
    adapter = TestBed.inject(HttpWaitlistAdapter)
    fetchSpy = spyOn(window, 'fetch').and.resolveTo({ ok: true } as Response)
  })

  it('should send payload to Apps Script in multiple formats', async () => {
    const request: JoinWaitlistRequest = {
      djName: 'DJ Test',
      email: 'test@example.com',
      country: 'US',
      gender: 'not_specified',
      referral: 'Instagram',
      consentMarketing: true,
    }

    const position = await adapter.joinWaitlist(request)
    expect(position.email).toBe('test@example.com')
    expect(fetchSpy.calls.count()).toBe(4)

    const first = fetchSpy.calls.argsFor(0)
    expect(first[1]?.method).toBe('POST')
    expect(first[1]?.mode).toBe('no-cors')
    const body = first[1]?.body as string
    expect(typeof body).toBe('string')
    expect(body).toContain('docName=Flowmix_Data')
    expect(body).toContain('sheetName=Waitlist')
    expect(body).toContain('headers=')
    expect(body).toContain('entry=')
  })
});
