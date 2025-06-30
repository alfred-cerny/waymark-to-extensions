<?php

namespace Espo\Modules\WaymarkTo\Hooks\Common;

use Espo\Core\Hook\Hook\BeforeSave;
use Espo\Core\Utils\Metadata;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;

/**
 * @implements BeforeSave<Entity>
 */
readonly class PrimaryKey implements BeforeSave {

	public function __construct(
		private Metadata $metadata
	) {}

	public function beforeSave(Entity $entity, SaveOptions $options): void {
		if ($entity->isNew() !== true) {
			return;
		}

		$entityType = $entity->getEntityType();
		$primaryKeyComposition = $this->metadata->get(['recordDefs', $entityType, 'primaryKeyComposition']);

		if (empty($primaryKeyComposition)) {
			return;
		}
		$primaryKeyComposition = (string)$primaryKeyComposition;
		$processedComposition = preg_replace_callback(
			'/\{([^}]+)}/',
			static function ($matches) use ($entity) {
				$fieldName = $matches[1];
				return $entity->get($fieldName);
			},
			$primaryKeyComposition
		);

		if ($this->isValidId($processedComposition) !== true) {
			return; //brainstorm whether we want to return or throw an error..
		}
		$entity->set('id', $processedComposition);
	}

	private function isValidId(string $id): bool {
		if (empty($id)) {
			return false;
		}

		if (strlen($id) > 17) {
			return false;
		}

		// Check for valid characters (alphanumeric, hyphens, underscores)
		if (!preg_match('/^[a-zA-Z0-9_-]+$/', $id)) {
			return false;
		}

		// Should not start or end with hyphen or underscore
		if (preg_match('/^[-_]|[-_]$/', $id)) {
			return false;
		}

		return true;
	}

}