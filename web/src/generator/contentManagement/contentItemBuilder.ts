// T016: ContentItemBuilder — port of C# ContentItemBuilder

import type { MandatoryContentItem, ContentPlacementRuleModel } from '../model.ts';
import { RulePresets } from './rulePresets.ts';
import type { DistanceVariation } from './distancePresets.ts';

export class ContentItemBuilder {
  private readonly _item: MandatoryContentItem = {};

  static create(sid: string): ContentItemBuilder {
    return new ContentItemBuilder().withSid(sid);
  }

  withSid(sid: string): this {
    this._item.sid = sid;
    return this;
  }

  withName(name: string): this {
    this._item.name = name;
    return this;
  }

  withVariant(variant: number): this {
    this._item.variant = variant;
    return this;
  }

  guarded(value = true): this {
    this._item.isGuarded = value;
    return this;
  }

  mine(value = true): this {
    this._item.isMine = value;
    return this;
  }

  soloEncounter(value = true): this {
    this._item.soloEncounter = value;
    return this;
  }

  addRule(rule: ContentPlacementRuleModel): this {
    this._item.rules ??= [];
    this._item.rules.push(rule);
    return this;
  }

  addRules(rules: ContentPlacementRuleModel[]): this {
    this._item.rules ??= [];
    this._item.rules.push(...rules);
    return this;
  }

  roadDistance(distance: DistanceVariation, weight = 1): this {
    return this.addRule(RulePresets.roadDistance(distance, weight));
  }

  addIncludeList(list: string): this {
    this._item.includeLists ??= [];
    this._item.includeLists.push(list);
    return this;
  }

  addIncludeLists(lists: string[]): this {
    this._item.includeLists ??= [];
    this._item.includeLists.push(...lists);
    return this;
  }

  build(): MandatoryContentItem {
    return { ...this._item };
  }
}
