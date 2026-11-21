/*
  ==============================================================================

    Regression test for the plugin state round-trip.

    Guards the APVTS state-persistence bug where getStateInformation() wrote
    apvts.state directly instead of flushing pending parameter writes through
    copyState() first: a host saving immediately after a parameter change
    would then persist the previous value.

    Scenario A: set every parameter, save, restore into a second processor
                and compare every parameter (the general round-trip).
    Scenario B: change one parameter and save immediately, without pumping
                the message loop, then restore and compare (the actual bug;
                this only passes when getStateInformation() flushes).

  ==============================================================================
*/

#include <JuceHeader.h>

#include "../Source/PluginProcessor.h"

#include <cmath>
#include <iostream>
#include <memory>
#include <vector>

namespace
{
// Runs the message loop for a while so pending AsyncUpdater work (the
// APVTS flush timer and ObstacleAudioProcessor::handleAsyncUpdate) gets a
// chance to run. The test target defines JUCE_MODAL_LOOPS_PERMITTED=1, so
// the modal-loop path is the one that compiles; the fallback keeps the file
// usable in a target without that define.
void pumpMessages (int millisecondsToRunFor)
{
   #if JUCE_MODAL_LOOPS_PERMITTED
    juce::MessageManager::getInstance()->runDispatchLoopUntil (millisecondsToRunFor);
   #else
    // Without modal loops the message queue cannot be pumped. The state
    // round-trip does not depend on async callbacks: APVTS flushes in
    // copyState() and restores in replaceState(), both synchronously.
    juce::Thread::sleep (millisecondsToRunFor);
   #endif
}

struct ParameterValue
{
    juce::String id;
    float denormalisedValue { 0.0f };
};

std::vector<ParameterValue> captureDenormalisedValues (juce::AudioProcessor& processor)
{
    std::vector<ParameterValue> values;

    for (auto* parameter : processor.getParameters())
    {
        if (auto* ranged = dynamic_cast<juce::RangedAudioParameter*> (parameter))
            values.push_back ({ ranged->getParameterID(),
                                ranged->convertFrom0to1 (ranged->getValue()) });
    }

    return values;
}

const ParameterValue* findParameterValue (const std::vector<ParameterValue>& values,
                                          const juce::String& parameterID)
{
    for (const auto& value : values)
        if (value.id == parameterID)
            return &value;

    return nullptr;
}

// Values travel through the ValueTree as denormalised floats, so the
// comparison is done in the same domain. The tolerance absorbs the float
// round-trip through convertTo0to1()/convertFrom0to1() for wide ranges
// (e.g. "Tuner Reference" at ~436 Hz), which costs a few ULP of the value.
bool approximatelyEqual (float a, float b)
{
    return std::abs (a - b) <= 1.0e-4f * juce::jmax (1.0f, std::abs (a), std::abs (b));
}

int compareValues (const std::vector<ParameterValue>& expected,
                   const std::vector<ParameterValue>& actual,
                   const juce::String& scenario)
{
    int numMismatches = 0;

    for (const auto& expectedValue : expected)
    {
        const auto* actualValue = findParameterValue (actual, expectedValue.id);

        if (actualValue == nullptr)
        {
            std::cout << "  [" << scenario << "] parameter \"" << expectedValue.id
                      << "\" is missing after restore" << std::endl;
            ++numMismatches;
            continue;
        }

        if (! approximatelyEqual (expectedValue.denormalisedValue, actualValue->denormalisedValue))
        {
            std::cout << "  [" << scenario << "] parameter \"" << expectedValue.id
                      << "\" expected " << expectedValue.denormalisedValue
                      << " but got " << actualValue->denormalisedValue << std::endl;
            ++numMismatches;
        }
    }

    return numMismatches;
}
} // namespace

int main()
{
    juce::ScopedJuceInitialiser_GUI juceInitialiser;

    bool failed = false;

    //==============================================================================
    // Scenario A: full round-trip of every parameter.
    {
        // Heap-allocated: the processor owns several multi-megabyte delay
        // lines, far more than the default 1 MB Windows thread stack.
        auto processorA = std::make_unique<ObstacleAudioProcessor>();

        int numParametersSet = 0;

        for (auto* parameter : processorA->getParameters())
        {
            if (auto* ranged = dynamic_cast<juce::RangedAudioParameter*> (parameter))
            {
                // A deterministic, non-default normalised value. Discrete
                // parameters (bool/choice) snap this to their nearest value,
                // which is fine: the comparison is against what was stored.
                ranged->setValueNotifyingHost (0.31f);
                ++numParametersSet;
            }
        }

        pumpMessages (100);

        juce::MemoryBlock savedState;
        processorA->getStateInformation (savedState);

        const auto expectedValues = captureDenormalisedValues (*processorA);

        auto processorB = std::make_unique<ObstacleAudioProcessor>();
        processorB->setStateInformation (savedState.getData(), (int) savedState.getSize());
        pumpMessages (100);

        const auto restoredValues = captureDenormalisedValues (*processorB);

        const auto numMismatches = compareValues (expectedValues, restoredValues, "A");

        if (numMismatches == 0)
        {
            std::cout << "PASS scenario A: " << numParametersSet
                      << " parameters round-tripped through get/setStateInformation"
                      << std::endl;
        }
        else
        {
            std::cout << "FAIL scenario A: " << numMismatches << " of " << numParametersSet
                      << " parameters did not round-trip" << std::endl;
            failed = true;
        }
    }

    //==============================================================================
    // Scenario B: save immediately after a change, without pumping, so only
    // getStateInformation()'s own flush can persist the new value.
    {
        auto processorA = std::make_unique<ObstacleAudioProcessor>();

        juce::RangedAudioParameter* changedParameter = nullptr;

        for (auto* parameter : processorA->getParameters())
        {
            if (auto* ranged = dynamic_cast<juce::RangedAudioParameter*> (parameter))
            {
                changedParameter = ranged;
                break;
            }
        }

        if (changedParameter == nullptr)
        {
            std::cout << "FAIL scenario B: no ranged parameter to change" << std::endl;
            return EXIT_FAILURE;
        }

        const juce::String changedParameterID = changedParameter->getParameterID();

        changedParameter->setValueNotifyingHost (0.77f);

        // Deliberately no pumpMessages() here: the save must flush the write.
        juce::MemoryBlock savedState;
        processorA->getStateInformation (savedState);

        const auto expectedValues = captureDenormalisedValues (*processorA);

        auto processorC = std::make_unique<ObstacleAudioProcessor>();
        processorC->setStateInformation (savedState.getData(), (int) savedState.getSize());
        pumpMessages (100);

        const auto restoredValues = captureDenormalisedValues (*processorC);

        const auto* expectedValue = findParameterValue (expectedValues, changedParameterID);
        const auto* restoredValue = findParameterValue (restoredValues, changedParameterID);

        if (expectedValue == nullptr || restoredValue == nullptr)
        {
            std::cout << "FAIL scenario B: parameter \"" << changedParameterID
                      << "\" not found" << std::endl;
            failed = true;
        }
        else if (! approximatelyEqual (expectedValue->denormalisedValue,
                                       restoredValue->denormalisedValue))
        {
            std::cout << "FAIL scenario B: parameter \"" << changedParameterID
                      << "\" expected " << expectedValue->denormalisedValue
                      << " but got " << restoredValue->denormalisedValue
                      << " (getStateInformation did not flush the pending write)"
                      << std::endl;
            failed = true;
        }
        else
        {
            std::cout << "PASS scenario B: immediate save persisted \"" << changedParameterID
                      << "\" = " << restoredValue->denormalisedValue << std::endl;
        }
    }

    if (failed)
    {
        std::cout << "state round-trip test FAILED" << std::endl;
        return EXIT_FAILURE;
    }

    std::cout << "state round-trip test PASSED" << std::endl;
    return EXIT_SUCCESS;
}
