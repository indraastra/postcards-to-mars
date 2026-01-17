import '../test-setup';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DialogueComponent } from './dialogue.component';
import { SessionStore } from '../store/session.store';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

describe('DialogueComponent', () => {
    let component: DialogueComponent;
    let fixture: ComponentFixture<DialogueComponent>;
    let storeMock: any;
    let routerMock: any;
    let currentActIndexSignal: WritableSignal<number>;

    beforeEach(async () => {
        vi.useFakeTimers();

        currentActIndexSignal = signal(0);
        vi.spyOn(currentActIndexSignal, 'set');

        storeMock = {
            originalImage: signal('test-img'),
            poemActs: signal([{ starter: 'Act1', suggestions: [] }, { starter: 'Act2', suggestions: [] }]),
            currentActIndex: currentActIndexSignal,
            poemHistory: signal([]),
            addPoemLine: vi.fn(),
            finalizePoem: vi.fn(),
        };

        routerMock = {
            navigate: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [DialogueComponent],
            providers: [
                { provide: SessionStore, useValue: storeMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DialogueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should clean prefix underscores when completing line', () => {
        // Arrange
        storeMock.poemActs.set([{ starter: 'Hello ____ world', suggestions: [] }]);
        component.customLine.set('beautiful');

        // Act
        component.submitCustomLine();

        // Assert
        expect(storeMock.addPoemLine).toHaveBeenCalledWith(expect.objectContaining({
            prefix: 'Hello',
            userInput: 'beautiful',
            suffix: 'world' // Should extract suffix
        }));
    });

    it('should complete line and advance to next act', () => {
        // Arrange
        // Current index is 0. Next is 1. Acts length is 2.
        component.customLine.set('my input');

        // Act
        component.submitCustomLine();

        // Assert
        expect(storeMock.addPoemLine).toHaveBeenCalled();

        // Advance timer for setTimeout(..., 0)
        vi.advanceTimersByTime(1);

        expect(storeMock.currentActIndex.set).toHaveBeenCalledWith(1);
        expect(routerMock.navigate).not.toHaveBeenCalledWith(['/generating']);
    });

    it('should finalize poem and navigate when acts are done', () => {
        // Arrange
        currentActIndexSignal.set(1); // Set directly on signal
        fixture.detectChanges(); // Update view/computed

        component.customLine.set('last input');

        // Act
        // Current index 1. Next 2. Acts length 2. 2 < 2 is False.
        component.submitCustomLine();

        // Assert
        // Logic path goes to else block immediately, NO setTimeout there in original code?
        // Let's check logic:
        // if (nextIndex < acts.length) { setTimeout... } else { finalize... }
        // So no timer needed here.

        expect(storeMock.finalizePoem).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/generating']);
    });
});
